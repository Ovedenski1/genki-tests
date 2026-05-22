"use client";

import { useEffect, useState } from "react";
import { createTerm, deleteTerm, fetchAdminTerms, updateTerm } from "@/lib/queries";
import type { GenkiTerm, GenkiTermInsert, GenkiTermUpdate, TermType } from "@/types/genki";

export function useAdmin() {
  const [terms, setTerms] = useState<GenkiTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ book?: number; chapter?: number; termType?: TermType }>({ book: 1 });

  async function loadTerms() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTerms(filters);
      setTerms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load terms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.book, filters.chapter, filters.termType]);

  async function saveTerm(term: GenkiTermInsert | GenkiTermUpdate, editingId?: string) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await updateTerm(editingId, term);
        setSuccess("Term updated successfully.");
      } else {
        await createTerm(term as GenkiTermInsert);
        setSuccess("Term added successfully.");
      }
      await loadTerms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save term.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTerm(term: GenkiTerm) {
    const ok = window.confirm(`Delete "${term.english}"? This cannot be undone.`);
    if (!ok) return;
    setDeletingId(term.id);
    setError(null);
    setSuccess(null);
    try {
      await deleteTerm(term.id);
      setSuccess("Term deleted successfully.");
      await loadTerms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete term.");
    } finally {
      setDeletingId(null);
    }
  }

  return { terms, loading, saving, deletingId, error, success, filters, setFilters, saveTerm, removeTerm, reload: loadTerms };
}