
// This file fixes the TypeScript error by simplifying the destructuring and error handling

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

const PayrollForm = ({ existingPayroll = null, onSuccess = () => {} }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employee_id: existingPayroll?.employee_id || '',
      payment_date: existingPayroll?.payment_date || '',
      amount: existingPayroll?.amount ? String(existingPayroll.amount) : '',
      payment_type: existingPayroll?.payment_type || '',
      status: existingPayroll?.status || 'pending',
    },
  });

  const onSubmit = async (data: PayrollFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (existingPayroll?.id) {
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
          .eq('id', existingPayroll.id);
          
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
      
      if (!existingPayroll) {
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : existingPayroll ? 'Update Payroll' : 'Create Payroll'}
        </Button>
      </form>
    </Form>
  );
};

export default PayrollForm;
