import React, { useEffect, useState } from "react";
import { getDoc, getDocFromCache, onSnapshot } from "firebase/firestore";

interface Options {
  initialValue?: any;
  subscribe?: boolean;
}

const useDocumentData = (
  dc: any,
  deps: Array<any>,
  { initialValue = [], subscribe = false }: Options
) => {
  const [state, setState] = useState<any>(initialValue);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let unsubscribe = () => {};
    setLoading(true);
    (async () => {
      if (subscribe) {
        unsubscribe = await onSnapshot(dc, (snapshot: any) => {
          setState(snapshot.data());
          setLoading(false);
        });
        return;
      }
      try {
        const snapshot = await getDocFromCache(dc);
        setState(snapshot.data());
        setLoading(false);
      } catch (err) {
        const snapshot = await getDoc(dc);
        setState(snapshot.data());
        setLoading(false);
      }
    })();
    return () => {
      unsubscribe();
    };
  }, deps);
  return [state, loading];
};

export default useDocumentData;
