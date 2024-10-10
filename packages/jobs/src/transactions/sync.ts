import { client, supabase } from "../client";
import { Jobs } from "../constants";
import { fetchEnabledBankAccountsForTeamSubTask } from "../subtasks/fetch-enabled-bank-account";
import { syncTransactionsSubTask } from "../subtasks/sync-transactions";
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

    try {
      // execute the sync transactions subtask for the accounts enabled for the team
      await syncTransactionsSubTask(io, accountsData, prefix);
    } catch (error) {
      console.error("Error occurred during processing:", error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }

    console.log("TRANSACTIONS_SYNC job completed");
  },
});


// if (transactionsData && transactionsData?.length > 0) {
//   console.log(
//     `Successfully upserted ${transactionsData.length} transactions`
//   );
//   // 4. Send notifications for new transactions
//   console.log("Sending notifications for new transactions");
//   await io.sendEvent("🔔 Send notifications", {
//     name: Events.TRANSACTIONS_NOTIFICATION,
//     payload: {
//       teamId,
//       transactions: transactionsData.map((transaction) => ({
//         id: transaction.id,
//         date: transaction.date,
//         amount: transaction.amount,
//         name: transaction.name,
//         currency: transaction.currency,
//         category: transaction.category_slug,
//         status: transaction.status,
//       })),
//     },
//   });

//   // 5. Revalidate relevant cache tags
//   console.log("Revalidating cache tags");
//   revalidateTag(`transactions_${teamId}`);
//   revalidateTag(`spending_${teamId}`);
//   revalidateTag(`metrics_${teamId}`);
//   revalidateTag(`expenses_${teamId}`);
// }