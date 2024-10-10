import { ConnectionStatus } from "@midday/supabase/types";
import FinancialEngine from "@solomon-ai/financial-engine-sdk";
import { revalidateTag } from "next/cache";
import { client, supabase } from "../client";
import { Events, Jobs } from "../constants";
import { fetchEnabledBankAccountsForTeamSubTask } from "../subtasks/fetch-enabled-bank-account";
import { syncTransactionsSubTask } from "../subtasks/sync-transactions";
import { updateBankConnectionStatus } from "../subtasks/update-bank-connection-status";
import { engine } from "../utils/engine";
import { parseAPIError } from "../utils/error";
import { getClassification, transformTransaction } from "../utils/transform";
import { scheduler } from "./scheduler";

client.defineJob({
  id: Jobs.TRANSACTIONS_SYNC,
  name: "Transactions - Sync",
  version: "0.0.1",
  trigger: scheduler,
  integrations: { supabase },
  /**
   * Synchronizes transactions for all enabled bank accounts of a team.
   *
   * @param _ - Unused parameter
   * @param io - Input/Output object for accessing Supabase client and logging
   * @param ctx - Context object containing the team ID
   *
   * Execution flow:
   * 1. Fetch enabled bank accounts for the team
   * 2. For each account:
   *    a. Update account balance
   *    b. Update bank connection last accessed timestamp
   *    c. Fetch and format new transactions
   * 3. Upsert all new transactions into the database
   * 4. Send notifications for new transactions
   * 5. Revalidate relevant cache tags
   */
  run: async (_, io, ctx) => {
    console.log("Starting TRANSACTIONS_SYNC job");
    const supabase = io.supabase.client;
    const teamId = ctx.source?.id as string;
    console.log(`Processing for team ID: ${teamId}`);
    const prefix = `team-txn-sync-${teamId}-${Date.now()}`;

    // 1. Fetch enabled bank accounts for the team
    console.log("Fetching enabled bank accounts");
    const accountsData = await fetchEnabledBankAccountsForTeamSubTask(
      io,
      teamId,
      "transactions-sync",
      { excludeManual: true }
    );

    console.log(`Found ${accountsData?.length || 0} enabled bank accounts`);

    // 2. Process each account
    const promises = accountsData?.map(async (account) => {
      console.log(`Processing account ID: ${account.id}`);
      try {
        // 2a. Update account balance
        console.log("Updating account balance");
        const balance = await engine.accounts.balance({
          provider: account.bank_connection.provider,
          id: account.account_id,
          accessToken: account.bank_connection?.access_token,
        });

        if (balance.data?.amount) {
          await io.supabase.client
            .from("bank_accounts")
            .update({ balance: balance.data.amount })
            .eq("id", account.id);
          console.log(`Updated balance for account ID: ${account.id}`);
        }

        // 2b. Update bank connection last accessed timestamp
        console.log("Updating bank connection last accessed timestamp");
        await io.supabase.client
          .from("bank_connections")
          .update({ last_accessed: new Date().toISOString() })
          .eq("id", account.bank_connection.id);
      } catch (error) {
        console.error(`Error processing account ${account.id}:`, error);
        // Handle API errors
        if (error instanceof FinancialEngine.APIError) {
          const parsedError = parseAPIError(error);
          await io.supabase.client
            .from("bank_connections")
            .update({
              status: parsedError.code,
              error_details: parsedError.message,
            })
            .eq("id", account.bank_connection.id);
          console.log(
            `Updated bank connection status for ID: ${account.bank_connection.id}`
          );
        }
      }

      // 2c. Fetch and format new transactions
      console.log(`Fetching transactions for account ID: ${account.id}`);
      const transactions = await engine.transactions.list({
        provider: account.bank_connection.provider,
        accountId: account.account_id,
        accountType: getClassification(account.type),
        accessToken: account.bank_connection?.access_token,
        latest: "true",
      });

      const formattedTransactions = transactions.data?.map((transaction) =>
        transformTransaction({
          transaction,
          teamId: account.team_id,
          bankAccountId: account.id,
        })
      );
      console.log(
        `Fetched ${formattedTransactions?.length || 0} transactions for account ID: ${account.id}`
      );

      return formattedTransactions;
    });

    try {
      if (promises) {
        // Wait for all account processing to complete
        console.log("Processing all accounts");

        // This code will run once, because we're manually creating a task with the "my-task" cacheKey
        const result = await io.runTask(
          `resolve-transaction-sync-promises_${teamId}`,
          async () => {
            return await await Promise.all(promises);
          },
          { name: "Transaction Sync Promise" }
        );

        const transactions = result.flat();
        console.log(`Total transactions fetched: ${transactions.length}`);

        if (!transactions?.length) {
          console.log("No new transactions to process");
          return null;
        }

        // 3. Upsert all new transactions into the database
        console.log("Upserting transactions into the database");
        const { error: transactionsError, data: transactionsData } =
          await supabase
            .from("transactions")
            .upsert(transactions as any, {
              onConflict: "internal_id",
              ignoreDuplicates: true,
            })
            .select("*");

        if (transactionsError) {
          console.error("Error upserting transactions:", transactionsError);
          await io.logger.error("Transactions error", transactionsError);
        }

        if (transactionsData && transactionsData?.length > 0) {
          console.log(
            `Successfully upserted ${transactionsData.length} transactions`
          );
          // 4. Send notifications for new transactions
          console.log("Sending notifications for new transactions");
          await io.sendEvent("🔔 Send notifications", {
            name: Events.TRANSACTIONS_NOTIFICATION,
            payload: {
              teamId,
              transactions: transactionsData.map((transaction) => ({
                id: transaction.id,
                date: transaction.date,
                amount: transaction.amount,
                name: transaction.name,
                currency: transaction.currency,
                category: transaction.category_slug,
                status: transaction.status,
              })),
            },
          });

          // 5. Revalidate relevant cache tags
          console.log("Revalidating cache tags");
          revalidateTag(`transactions_${teamId}`);
          revalidateTag(`spending_${teamId}`);
          revalidateTag(`metrics_${teamId}`);
          revalidateTag(`expenses_${teamId}`);
        }

        revalidateTag(`bank_accounts_${teamId}`);
        console.log("Cache tags revalidated");
      }
    } catch (error) {
      // Log any errors that occur during processing
      console.error("Error in transaction sync process:", error);
      await io.logger.debug(`Team id: ${teamId}`);
      await io.logger.error(
        error instanceof Error ? error.message : String(error)
      );
    }

    console.log("TRANSACTIONS_SYNC job completed");
  },
});
