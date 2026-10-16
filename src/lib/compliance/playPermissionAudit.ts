/**
 * Android Play permission audit — pure module for scanning AndroidManifest.xml.
 * Reference: https://github.com/android/skills (Apache-2.0) — cited for policy context only.
 *
 * Maps manifest permissions to Play Policy risk categories:
 * - restricted: requires declaration + may trigger review
 * - sensitive: declaration required, may need justification
 */

export type PermissionFinding = {
  permission: string;
  risk: 'restricted' | 'sensitive';
  note: string;
};

/** Map of permission name (suffix after android.permission.) to risk + note */
const PERMISSION_MAP: Record<string, { risk: 'restricted' | 'sensitive'; note: string }> = {
  // Restricted: SMS and Call Log (Google Play "Restricted permissions")
  READ_SMS: { risk: 'restricted', note: 'SMS read — requires default handler or full use case' },
  SEND_SMS: { risk: 'restricted', note: 'SMS send — requires default handler or full use case' },
  RECEIVE_SMS: { risk: 'restricted', note: 'SMS receive — requires default handler or full use case' },
  READ_CALL_LOG: { risk: 'restricted', note: 'Call log read — requires default dialer or full use case' },
  WRITE_CALL_LOG: { risk: 'restricted', note: 'Call log write — requires default dialer or full use case' },
  PROCESS_OUTGOING_CALLS: { risk: 'restricted', note: 'Outgoing call processing — requires default dialer' },

  // Restricted: Other sensitive operations
  ACCESS_BACKGROUND_LOCATION: { risk: 'restricted', note: 'Background location — requires declaration + prominent disclosure' },
  QUERY_ALL_PACKAGES: { risk: 'restricted', note: 'All packages query — restricted to specific use cases' },
  MANAGE_EXTERNAL_STORAGE: { risk: 'restricted', note: 'All files access — restricted to file managers only' },
  REQUEST_INSTALL_PACKAGES: { risk: 'restricted', note: 'Package installation — restricted to installers' },

  // Sensitive: Other permissions requiring justification
  ACTIVITY_RECOGNITION: { risk: 'sensitive', note: 'Physical activity — requires prominent disclosure' },
  BODY_SENSORS: { risk: 'sensitive', note: 'Body sensors — requires prominent disclosure' },
  SCHEDULE_EXACT_ALARM: { risk: 'sensitive', note: 'Exact alarm scheduling — requires USE_EXACT_ALARM or user-granted' },
  USE_EXACT_ALARM: { risk: 'sensitive', note: 'Use exact alarm — granted by default on most versions' },

  // Health permissions (android.permission.health.*)
  READ_BODY_SENSORS: { risk: 'sensitive', note: 'Body sensors read — health data consideration' },
  READ_HEALTH_DATA: { risk: 'sensitive', note: 'Health data read — Google Fit API recommended' },
  WRITE_HEALTH_DATA: { risk: 'sensitive', note: 'Health data write — Google Fit API recommended' },
};

/**
 * Add wildcard matches for health.* and foreground service types
 */
function getPermissionInfo(perm: string): { risk: 'restricted' | 'sensitive'; note: string } | undefined {
  // Direct match
  if (perm in PERMISSION_MAP) {
    return PERMISSION_MAP[perm];
  }

  // Health prefix match
  if (perm.startsWith('health.')) {
    return { risk: 'sensitive', note: `Health permission ${perm} — Google Fit API recommended` };
  }

  // Foreground service type matches
  if (perm.startsWith('FOREGROUND_SERVICE_')) {
    return { risk: 'sensitive', note: `Foreground service ${perm} — requires prominent disclosure` };
  }

  return undefined;
}

/**
 * Parse AndroidManifest.xml string and return permission findings.
 * Uses regex over the XML string for simplicity (no XML parser dependency).
 *
 * @param xml - Raw AndroidManifest.xml content
 * @returns Array of findings for permissions that match restricted/sensitive categories
 */
export function auditManifest(xml: string): PermissionFinding[] {
  const findings: PermissionFinding[] = [];

  // Regex to match <uses-permission android:name="android.permission.XXX" />
  // Handles variations: self-closing, with other attrs, whitespace
  const regex = /<uses-permission\s+android:name\s*=\s*["']([^"']+)["']/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const fullPerm = match[1];

    // Strip android.permission. prefix if present
    const perm = fullPerm.startsWith('android.permission.')
      ? fullPerm.replace('android.permission.', '')
      : fullPerm;

    const info = getPermissionInfo(perm);
    if (info) {
      findings.push({
        permission: fullPerm,
        risk: info.risk,
        note: info.note,
      });
    }
    // Unknown permissions are not returned (as per spec)
  }

  return findings;
}
