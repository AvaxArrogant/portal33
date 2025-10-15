
import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 50:"#F7F8FB",100:"#EEF1F6",200:"#DCE1EB",300:"#C8CFDD",400:"#A2A9B8",500:"#768199",600:"#56607A",700:"#36425A",800:"#1E2A40",900:"#111C2B" },
        gold: { 50:"#fffbeb",100:"#fef6c8",200:"#fdf093",300:"#fce95e",400:"#fbe229",500:"#fbd800",600:"#e2c200",700:"#b99f00",800:"#917c00",900:"#716100" }
      },
      boxShadow:{ soft:"0 12px 30px rgba(17,28,43,.08)" },
      backgroundImage:{ "gold-grad":"linear-gradient(180deg,#f4c44a 0%, #d59211 100%)" },
      borderRadius:{ "2xl":"1.25rem" }
    }
  },
  plugins: []
};
export default config;