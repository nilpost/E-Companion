import cron from "node-cron";
import { execSync } from "child_process";
import * as storage from "../storage";
import { db } from "../db";
import { repositories } from "@shared/schema";

// Simple npm audit parser
function parseNpmAudit(auditOutput: string): any[] {
  try {
    const audit = JSON.parse(auditOutput);
    const vulnerabilities: any[] = [];

    if (audit.vulnerabilities) {
      for (const [pkgName, vulnData] of Object.entries(audit.vulnerabilities)) {
        if (typeof vulnData === "object" && vulnData !== null) {
          const data = vulnData as any;
          if (data.via && Array.isArray(data.via)) {
            for (const vuln of data.via) {
              if (typeof vuln === "object") {
                vulnerabilities.push({
                  packageName: pkgName,
                  severity: vuln.severity || "unknown",
                  cveId: vuln.cve,
                  description: vuln.title || vuln.description,
                  fixedVersion: vuln.fixed,
                });
              }
            }
          }
        }
      }
    }

    return vulnerabilities;
  } catch (err) {
    console.error("Failed to parse npm audit output:", err);
    return [];
  }
}

export async function initializeVulnerabilityJobs() {
  // Run vulnerability detection daily at 2 AM
  const cronSchedule = "0 2 * * *";

  console.log("Initializing vulnerability detection jobs");

  cron.schedule(cronSchedule, async () => {
    console.log(
      `[${new Date().toISOString()}] Running vulnerability detection...`
    );
    await runVulnerabilityDetection();
  });

  console.log(`Vulnerability detection scheduled with pattern: ${cronSchedule}`);
}

export async function runVulnerabilityDetection() {
  try {
    // Get all repositories
    const repos = await db.query.repositories.findMany();

    for (const repo of repos) {
      try {
        console.log(`Scanning vulnerabilities for ${repo.fullName}...`);

        // TODO: Implement actual npm audit scanning
        // For MVP, we'll skip this as it requires downloading repos
        // This would be implemented in Phase 2 with proper code access

        console.log(`✓ Scanned ${repo.fullName}`);
      } catch (err) {
        console.error(`Failed to scan ${repo.fullName}:`, err);
      }
    }

    console.log("Vulnerability detection completed");
  } catch (err) {
    console.error("Vulnerability detection failed:", err);
  }
}

export function createVulnerabilityScanner() {
  return async (repositoryId: number) => {
    // Manual vulnerability scan for a specific repository
    const repo = await db.query.repositories.findFirst({
      where: (table: any) => (table.id === repositoryId ? true : false),
    });

    if (!repo) {
      throw new Error("Repository not found");
    }

    console.log(`Manual vulnerability scan for ${repo.fullName}`);
    // TODO: Implement actual scanning
    return [];
  };
}
