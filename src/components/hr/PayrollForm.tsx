
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import supabase from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const payrollSchema = z.object({
  employee_id: z.string().min(1, { message: "Employee ID is required" }),
  payment_date: z.string().min(1, { message: "Payment date is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  payment_type: z.string().min(1, { message: "Payment type is required" }),
  status: z.string().min(1, { message: "Status is required" }),
});

type PayrollFormValues = z.infer<typeof payrollSchema>;

// Update the props interface to include employeeId and onCancel
interface PayrollFormProps {
  employeeId?: number;
  existingPayroll?: any;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PayrollForm = ({ 
  employeeId, 
  existingPayroll = null, 
  initialData = null,
  onSuccess = () => {}, 
  onCancel = () => {} 
}: PayrollFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Use initialData if provided, otherwise use existingPayroll
  const payrollData = initialData || existingPayroll;

  // Use employeeId if provided from props
  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employee_id: employeeId ? String(employeeId) : payrollData?.employee_id || '',
      payment_date: payrollData?.payment_date || '',
      amount: payrollData?.amount ? String(payrollData.amount) : '',
      payment_type: payrollData?.payment_type || '',
      status: payrollData?.status || 'pending',
    },
  });

  const onSubmit = async (data: PayrollFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (payrollData?.id) {
        // Update existing payroll
        const { error } = await supabase
          .from('payroll')
          .update({
            employee_id: data.employee_id,
            payment_date: data.payment_date,
            amount: parseFloat(data.amount),
            payment_type: data.payment_type,
            status: data.status,
          })
          .eq('id', payrollData.id);
          
        if (error) throw error;
        
        toast.success('Payroll record updated successfully');
      } else {
        // Create new payroll
        const { error } = await supabase
          .from('payroll')
          .insert({
            employee_id: data.employee_id,
            payment_date: data.payment_date,
            amount: parseFloat(data.amount),
            payment_type: data.payment_type,
            status: data.status,
          });
          
        if (error) throw error;
        
        toast.success('Payroll record created successfully');
      }
      
      onSuccess();
      
      if (!payrollData) {
        form.reset();
      }
    } catch (error) {
      console.error('Error saving payroll:', error);
      toast.error('Failed to save payroll record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* If employeeId is provided, we don't need to show the employee_id field */}
        {!employeeId && (
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID</FormLabel>
                <FormControl>
                  <Input placeholder="Employee ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="payment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="reimbursement">Reimbursement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : payrollData ? 'Update Payroll' : 'Create Payroll'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PayrollForm;
