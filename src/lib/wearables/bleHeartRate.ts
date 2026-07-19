/**
 * Web Bluetooth heart-rate monitor (GATT Heart Rate Service 0x180D).
 * Chrome/Android: supported. Safari: generally unsupported.
 */
const HR_SERVICE = 0x180d;
const HR_MEASUREMENT = 0x2a37;

export type BleHrConnection = {
  deviceName: string;
  disconnect: () => void;
};

function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0);
  const hr16 = (flags & 0x1) !== 0;
  return hr16 ? value.getUint16(1, true) : value.getUint8(1);
}

export function isWebBluetoothAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

export async function connectHeartRateMonitor(
  onBpm: (bpm: number) => void
): Promise<BleHrConnection> {
  if (!isWebBluetoothAvailable()) {
    throw new Error('Web Bluetooth is not available in this browser');
  }

  const device = await navigator.bluetooth!.requestDevice({
    filters: [{ services: [HR_SERVICE] }],
    optionalServices: [HR_SERVICE],
  });

  const server = await device.gatt!.connect();
  const service = await server.getPrimaryService(HR_SERVICE);
  const characteristic = await service.getCharacteristic(HR_MEASUREMENT);

  const handler = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    if (!target.value) return;
    onBpm(parseHeartRate(target.value));
  };

  characteristic.addEventListener('characteristicvaluechanged', handler);
  await characteristic.startNotifications();

  const disconnect = () => {
    try {
      characteristic.removeEventListener('characteristicvaluechanged', handler);
      characteristic.stopNotifications().catch(() => undefined);
    } catch {
      /* ignore */
    }
    try {
      device.gatt?.disconnect();
    } catch {
      /* ignore */
    }
  };

  device.addEventListener('gattserverdisconnected', disconnect);

  return {
    deviceName: device.name || 'Heart rate monitor',
    disconnect,
  };
}
