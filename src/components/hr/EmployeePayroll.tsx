
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PayrollForm from './PayrollForm';

type EmployeePayrollProps = {
  employeeId: number;
};

type PayrollData = {
  id: string;
  employee_id: number;
  salary: number;
  last_updated: string;
};

const EmployeePayroll = ({ employeeId }: EmployeePayrollProps) => {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_payroll')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching payroll data:', error);
      }

      setPayrollData(data);
    } catch (error) {
      console.error('Error in fetchPayrollData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchPayrollData();
    }
  }, [employeeId]);

  const handleEditPayroll = () => {
    setShowEditDialog(true);
  };

  const handleDialogClose = () => {
    setShowEditDialog(false);
  };

  const handlePayrollSaved = () => {
    fetchPayrollData();
    setShowEditDialog(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Payroll Information
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleEditPayroll}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : payrollData ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <div>
                <p className="text-sm font-medium">Current Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(payrollData.salary)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {formatDate(payrollData.last_updated)}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No payroll information available</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={handleEditPayroll}>
              Add Payroll Details
            </Button>
          </div>
        )}
      </CardContent>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{payrollData ? 'Edit Payroll Information' : 'Add Payroll Information'}</DialogTitle>
          </DialogHeader>
          <PayrollForm
            employeeId={employeeId}
            existingData={payrollData}
            onSave={handlePayrollSaved}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmployeePayroll;
