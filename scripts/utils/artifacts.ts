import { promises as fs } from "fs";
import path from "path";

export interface ContractArtifact {
  address: string;
  abi: unknown;
}

export interface DeploymentArtifacts {
  network: string;
  chainId: number;
  lastUpdated: string;
  contracts: Record<string, ContractArtifact>;
}

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const DEPLOYMENTS_DIR = path.join(ROOT_DIR, "deployments");
const FRONTEND_DIR = path.join(ROOT_DIR, "frontend", "lib", "contracts");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function writeDeploymentArtifacts(
  filename: string,
  manifest: DeploymentArtifacts
): Promise<void> {
  const data = JSON.stringify(manifest, null, 2);

  await ensureDir(DEPLOYMENTS_DIR);
  await ensureDir(FRONTEND_DIR);

  await fs.writeFile(path.join(DEPLOYMENTS_DIR, filename), data, "utf8");
  await fs.writeFile(path.join(FRONTEND_DIR, filename), data, "utf8");
}

export async function readDeploymentArtifacts(filename: string): Promise<DeploymentArtifacts> {
  const filePath = path.join(DEPLOYMENTS_DIR, filename);
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file) as DeploymentArtifacts;
}

export function createManifest(
  network: string,
  chainId: number,
  contracts: Record<string, ContractArtifact>
): DeploymentArtifacts {
  return {
    network,
    chainId,
    lastUpdated: new Date().toISOString(),
    contracts,
  };
}
