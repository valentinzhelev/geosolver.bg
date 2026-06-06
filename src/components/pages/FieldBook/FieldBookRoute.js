import React, { useEffect, useState } from 'react';
import Layout from '../../layout/Layout';
import { fieldbookPilotApi } from '../../../services/fieldbookApi';
import FieldBookPilotGate from './FieldBookPilotGate';
import FieldBookWorkspace from './FieldBookWorkspace';

const FieldBookRoute = () => {
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(null);
  const [request, setRequest] = useState(null);

  const loadAccess = async () => {
    setLoading(true);
    try {
      const res = await fieldbookPilotApi.getAccess();
      setAccess(res.access);
      setRequest(res.data);
    } catch {
      setAccess({ approved: false, status: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccess();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="w-full text-center py-20 text-neutral-500 dark:text-zinc-400 font-['Manrope']">
          Зареждане...
        </div>
      </Layout>
    );
  }

  if (!access?.approved) {
    return (
      <FieldBookPilotGate
        access={{ ...access, adminNote: request?.adminNote }}
        onAccessChange={(newAccess, newRequest) => {
          setAccess(newAccess);
          setRequest(newRequest);
        }}
      />
    );
  }

  return <FieldBookWorkspace />;
};

export default FieldBookRoute;
