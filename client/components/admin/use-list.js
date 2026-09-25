"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useList(path) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(path);
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      setRows([]);
      toast.error(error.response?.data?.message || "Could not load this list");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, loading, reload };
}
