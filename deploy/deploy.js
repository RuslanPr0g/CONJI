import { execSync } from "child_process";
import { join } from "path";

const scriptDir = __dirname;

try {
  execSync(`sh ${join(scriptDir, "deploy.sh")}`, { stdio: "inherit" });
} catch (err) {
  console.error("❌ Deployment script failed:", err.message);
  process.exit(1);
}
