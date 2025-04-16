import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export function validateEnv(envPath: string, examplePath: string) {
  // 检查文件是否存在
  if (!fs.existsSync(envPath)) {
    console.error(`错误：缺少环境配置文件 ${envPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(examplePath)) {
    console.error(`错误：缺少环境配置模板文件 ${examplePath}`);
    process.exit(1);
  }

  // 读取并解析环境文件
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  const exampleConfig = dotenv.parse(fs.readFileSync(examplePath));

  // 检查是否所有必需的字段都存在
  const missingKeys = Object.keys(exampleConfig).filter(
    (key) => !(key in envConfig),
  );
  if (missingKeys.length > 0) {
    console.error("错误：环境配置文件缺少以下必需字段：");
    missingKeys.forEach((key) => console.error(`- ${key}`));
    process.exit(1);
  }

  // 检查是否所有字段都有值
  const emptyKeys = Object.entries(envConfig)
    .filter(([key, value]) => value.trim() === "")
    .map(([key]) => key);

  if (emptyKeys.length > 0) {
    console.error("错误：以下环境变量未设置值：");
    emptyKeys.forEach((key) => console.error(`- ${key}`));
    process.exit(1);
  }

  // 加载环境变量
  dotenv.config({ path: envPath });

  console.log(`成功加载环境配置文件: ${envPath}`);
}
