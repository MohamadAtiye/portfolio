import { MenuItem, Select } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  checkAndQueryCameraPermission,
  listVideoDevices,
} from "../helpers/WebRtc";

interface DeviceSelectProps {
  deviceId: string;
  setStreamArgs: React.Dispatch<
    React.SetStateAction<{
      resolution: string;
      deviceId: string;
      permission: string;
      advanced: {
        [x: string]: number | string;
      }[];
    }>
  >;
}
export default function DeviceSelect({
  deviceId,
  setStreamArgs,
}: DeviceSelectProps) {
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);

  // handle device listing and selection
  useEffect(() => {
    async function updateListAndSelection() {
      // check permission
      const permission = await checkAndQueryCameraPermission();
      if (permission !== "granted") {
        setStreamArgs((p) => ({
          ...p,
          permission,
        }));
        return;
      }

      // get devices
      const devices = await listVideoDevices();
      setDeviceList(devices);
      // update selection if needed
      if (!deviceId || !devices.find((d) => d.deviceId === deviceId)) {
        setStreamArgs((p) => ({
          ...p,
          deviceId: devices[0]?.deviceId ?? "",
          permission,
        }));
      }
    }
    updateListAndSelection();
    navigator.mediaDevices.addEventListener(
      "devicechange",
      updateListAndSelection
    );
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        updateListAndSelection
      );
    };
  }, [deviceId, setStreamArgs]);
  return (
    <Select
      value={deviceId}
      onChange={(e) => {
        setStreamArgs((p) => ({
          ...p,
          deviceId: e.target.value as string,
        }));
      }}
      size="small"
      sx={{ flex: 1, minWidth: "350px" }}
    >
      {deviceList.map((device) => (
        <MenuItem key={device.deviceId} value={device.deviceId}>
          {device.label || `Camera ${device.deviceId}`}
        </MenuItem>
      ))}
    </Select>
  );
}
