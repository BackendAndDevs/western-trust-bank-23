import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Shield, 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ServiceRequest {
  id: string;
  service_type: string;
  status: string;
  created_at: string;
  amount?: number;
  details?: any;
}

const Services = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState("");
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [requestForm, setRequestForm] = useState({
    amount: "",
    purpose: "",
    annualIncome: "",
    creditScore: "",
    employmentStatus: "",
    additionalInfo: ""
  });

  const serviceTypes = [
    { 
      id: "credit_card", 
      name: "Credit Card", 
      icon: CreditCard, 
      color: "text-blue-600",
      description: "Apply for a new credit card with competitive rates"
    },
    { 
      id: "savings_account", 
      name: "Savings Account", 
      icon: PiggyBank, 
      color: "text-green-600",
      description: "Open a high-yield savings account"
    },
    { 
      id: "investment", 
      name: "Investment Services", 
      icon: TrendingUp, 
      color: "text-purple-600",
      description: "Get started with investment and wealth management"
    },
    { 
      id: "insurance", 
      name: "Insurance", 
      icon: Shield, 
      color: "text-orange-600",
      description: "Protect your assets with our insurance products"
    }
  ];

  const fetchServiceRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map loan requests to service requests format
      const mappedData = data?.map(item => ({
        id: item.id,
        service_type: item.loan_type,
        status: item.status,
        created_at: item.created_at,
        amount: item.amount,
        details: {
          purpose: item.purpose,
          annual_income: item.annual_income,
          credit_score: item.credit_score,
          employment_status: item.employment_status
        }
      })) || [];
      
      setServiceRequests(mappedData);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchServiceRequests();
  }, [user]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedService) {
      toast({
        title: "Error",
        description: "Please select a service type",
        variant: "destructive"
      });
      return;
    }

    try {
      let insertData: any = {
        user_id: user.id,
        loan_type: selectedService,
        status: 'pending'
      };

      // Different fields based on service type
      if (selectedService === 'credit_card') {
        insertData.purpose = 'Credit Card Application';
        insertData.amount = parseFloat(requestForm.amount) || 5000; // Default credit limit
        insertData.annual_income = parseFloat(requestForm.annualIncome) || null;
        insertData.credit_score = parseInt(requestForm.creditScore) || null;
        insertData.employment_status = requestForm.employmentStatus || null;
      } else if (selectedService === 'savings_account') {
        insertData.purpose = 'Savings Account Opening';
        insertData.amount = parseFloat(requestForm.amount) || 100; // Minimum deposit
      } else if (selectedService === 'investment') {
        insertData.purpose = requestForm.purpose || 'Investment Services';
        insertData.amount = parseFloat(requestForm.amount) || 1000;
        insertData.annual_income = parseFloat(requestForm.annualIncome) || null;
      } else if (selectedService === 'insurance') {
        insertData.purpose = requestForm.purpose || 'Insurance Application';
        insertData.amount = parseFloat(requestForm.amount) || 0;
      }

      const { error } = await supabase
        .from('loan_requests')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Service Request Submitted",
        description: "Your service request has been submitted for review.",
      });

      setSelectedService("");
      setRequestForm({
        amount: "",
        purpose: "",
        annualIncome: "",
        creditScore: "",
        employmentStatus: "",
        additionalInfo: ""
      });

      // Refresh the requests list
      fetchServiceRequests();
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast({
        title: "Error",
        description: "Failed to submit service request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-lg font-semibold">Service Requests</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request New Service */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request New Service</CardTitle>
                <CardDescription>
                  Choose from our range of banking services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {serviceTypes.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedService === service.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <service.icon className={`w-6 h-6 mt-1 ${service.color}`} />
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Request Form */}
                {selectedService && (
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">
                        {serviceTypes.find(s => s.id === selectedService)?.name} Request
                      </h3>
                    </div>

                    {(selectedService === 'credit_card' || selectedService === 'investment') && (
                      <div>
                        <Label htmlFor="amount">Requested Amount/Limit</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={requestForm.amount}
                          onChange={(e) => setRequestForm({
                            ...requestForm,
                            amount: e.target.value
                          })}
                          min="1"
                        />
                      </div>
                    )}

                    {selectedService === 'savings_account' && (
                      <div>
                        <Label htmlFor="amount">Initial Deposit</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Minimum $100"
                          value={requestForm.amount}
                          onChange={(e) => setRequestForm({
                            ...requestForm,
                            amount: e.target.value
                          })}
                          min="100"
                        />
                      </div>
                    )}

                    {(selectedService === 'investment' || selectedService === 'insurance') && (
                      <div>
                        <Label htmlFor="purpose">Purpose/Goal</Label>
                        <Input
                          id="purpose"
                          placeholder="Describe your needs"
                          value={requestForm.purpose}
                          onChange={(e) => setRequestForm({
                            ...requestForm,
                            purpose: e.target.value
                          })}
                        />
                      </div>
                    )}

                    {(selectedService === 'credit_card' || selectedService === 'investment') && (
                      <>
                        <div>
                          <Label htmlFor="annual-income">Annual Income</Label>
                          <Input
                            id="annual-income"
                            type="number"
                            placeholder="Your annual income"
                            value={requestForm.annualIncome}
                            onChange={(e) => setRequestForm({
                              ...requestForm,
                              annualIncome: e.target.value
                            })}
                          />
                        </div>

                        {selectedService === 'credit_card' && (
                          <>
                            <div>
                              <Label htmlFor="credit-score">Credit Score (Optional)</Label>
                              <Input
                                id="credit-score"
                                type="number"
                                placeholder="300-850"
                                value={requestForm.creditScore}
                                onChange={(e) => setRequestForm({
                                  ...requestForm,
                                  creditScore: e.target.value
                                })}
                                min="300"
                                max="850"
                              />
                            </div>

                            <div>
                              <Label htmlFor="employment">Employment Status</Label>
                              <Select
                                value={requestForm.employmentStatus}
                                onValueChange={(value) => setRequestForm({
                                  ...requestForm,
                                  employmentStatus: value
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employment status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="full-time">Full-time</SelectItem>
                                  <SelectItem value="part-time">Part-time</SelectItem>
                                  <SelectItem value="self-employed">Self-employed</SelectItem>
                                  <SelectItem value="unemployed">Unemployed</SelectItem>
                                  <SelectItem value="retired">Retired</SelectItem>
                                  <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <div>
                      <Label htmlFor="additional-info">Additional Information</Label>
                      <Textarea
                        id="additional-info"
                        placeholder="Any additional details..."
                        value={requestForm.additionalInfo}
                        onChange={(e) => setRequestForm({
                          ...requestForm,
                          additionalInfo: e.target.value
                        })}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Submit Request
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Existing Requests */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Service Requests</CardTitle>
                <CardDescription>
                  Track the status of your submitted requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading requests...</p>
                  </div>
                ) : serviceRequests.length > 0 ? (
                  <div className="space-y-4">
                    {serviceRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium capitalize">
                            {request.service_type.replace('_', ' ')}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(request.status)} text-white`}
                          >
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                        </div>
                        
                        {request.amount && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Amount: ${request.amount.toLocaleString()}
                          </p>
                        )}
                        
                        {request.details?.purpose && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Purpose: {request.details.purpose}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          Submitted: {formatDate(request.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No service requests yet</p>
                    <p className="text-sm text-muted-foreground">
                      Submit your first request to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
