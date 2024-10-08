import { InfiniteMovingCards } from "@/components/infinite-moving-cards";

const testimonials = [
  {
    name: "Lucas Grey",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1744288035314008064/kAQycMrk_400x400.png",
    handle: "@ImLucasGrey",
    verified: true,
    quote: "This is so ingenious and good!",
  },
  {
    name: "Patrick Tobler",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1643364165627551744/Z92S8fqD_400x400.jpg",
    handle: "@Padierfind",
    verified: true,
    quote: "I love this",
  },
  {
    name: "Ben Tossell",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1595060668897677314/pHMUc1Zb_400x400.jpg",
    handle: "@bentossell",
    verified: true,
    quote:
      "well, an actually enjoyable way to organise my whole in and out of my business, plus highlighted a bunch of things I need to cancel",
  },
  {
    name: "Christian Alares",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1194368464946974728/1D2biimN_400x400.jpg",
    handle: "@c_alares",
    verified: true,
    quote: "Omg, this is so cool!",
  },
  {
    name: "Zeno Rocha",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1145166093029265408/9gJSVrQ7_400x400.jpg",
    handle: "@zenorocha",
    verified: true,
    quote: "this is absolutely amazing",
  },
  {
    name: "Bailey Simrell",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1488962358609330178/tdTC7o6M_400x400.jpg",
    handle: "@baileysimrell",
    verified: true,
    quote: "Awesome man, looks amazing 🔥",
  },
  {
    name: "Cal.com",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1729977047999524864/suW5VpQZ_400x400.jpg",
    handle: "@calcom",
    verified: true,
    quote: "We love @middayai 🖤",
  },
  {
    name: "Guillermo Rauch",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg",
    handle: "@rauchg",
    verified: true,
    quote:
      "nice to see @middayai generative ui features built on @vercel AI sdk midday is becoming one of the best OSS @nextjs real-world apps",
  },
  {
    name: "Kyle @ KyTech",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1586538348964978689/nkpJWZxG_400x400.png",
    handle: "@KyTechInc",
    verified: true,
    quote: "so ready! 🙌",
  },
  {
    name: "Steven Tey",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1506792347840888834/dS-r50Je_400x400.jpg",
    handle: "@steventey",
    verified: true,
    quote: `Just found my new favorite open-source project → http://solomon-ai.app

    It's a modern layer on top of Quickbooks/Xero that lets you automate the tedious accounting aspects of your business and focus on what matters – your product.
    
    Built by the 🐐s 
    @pontusab
     + 
    @viktorhofte
     👏`,
  },
  {
    name: "Gokul",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1687344852600516608/gVS34j7h_400x400.jpg",
    handle: "@KyTechInc",
    verified: true,
    quote: "🖤 Awesome work. just love it.",
  },
  {
    name: "Peer Richelsen — oss/acc",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1623291991709700097/aBL_VpMC_400x400.jpg",
    handle: "@peer_rich",
    verified: true,
    quote:
      "the best thing i couldve done as a founder is build something that helps other founders. so proud 🖤 @middayai",
  },
];

interface TestimonialProps {
  enable?: boolean;
}

export function Testimonials({ enable = false }: TestimonialProps) {
  if (!enable) {
    return null;
  }

  return (
    <div className="pb-22 relative">
      <h3 className="mb-8 text-4xl font-medium">What people say</h3>
      <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
    </div>
  );
}
