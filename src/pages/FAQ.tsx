import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I open an account?",
      answer: "Opening an account is simple! Click the 'Get Started' button, fill out the online application form, and verify your identity. You can start banking within minutes."
    },
    {
      question: "Is my money safe with Western Trust Bank?",
      answer: "Absolutely! All accounts are FDIC insured up to $250,000 per depositor. We also use bank-level encryption and advanced security measures to protect your data."
    },
    {
      question: "What are the fees for transfers?",
      answer: "Internal transfers are free. External transfers are also free for amounts under $1,000. Transfers over $1,000 incur a $25 processing fee. Daily limits apply for security purposes."
    },
    {
      question: "How long do external transfers take?",
      answer: "External transfers typically take 1-3 business days to process. You'll receive email updates throughout the transfer process."
    },
    {
      question: "Can I access my account on mobile?",
      answer: "Yes! Our platform is fully responsive and works seamlessly on all devices. You can access your account from your phone, tablet, or computer."
    },
    {
      question: "What is the daily withdrawal limit?",
      answer: "The daily withdrawal limit is $200,000. This limit is in place for security purposes to protect your account."
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page. Enter your email address, and we'll send you a secure link to reset your password."
    },
    {
      question: "Do you offer business accounts?",
      answer: "Yes! We offer comprehensive business banking solutions including business checking, savings, and loan services. Contact our business banking team for more information."
    },
    {
      question: "How can I contact customer support?",
      answer: "We're available 24/7! Call us at 1-800-SECURE, email support@westerntrust.com, or use the contact form on our website. We typically respond within 24 hours."
    },
    {
      question: "Are there any monthly maintenance fees?",
      answer: "We offer fee-free checking and savings accounts with no minimum balance requirements. Premium accounts with additional features may have monthly fees."
    },
    {
      question: "Can I deposit checks using my phone?",
      answer: "Yes! Our mobile platform supports mobile check deposits. Simply take a photo of your check and submit it through your account dashboard."
    },
    {
      question: "What security features do you offer?",
      answer: "We offer two-factor authentication, real-time fraud monitoring, transaction alerts, and the ability to freeze your account instantly if you suspect unauthorized activity."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="shrink-0">
            <Logo size="sm" />
          </Link>
          
          <div className="flex space-x-4">
            <Button asChild variant="outline" className="transition-all duration-300 hover:shadow-elegant">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild className="transition-all duration-300 hover:shadow-elegant">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-banking-green-light to-accent">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our banking services, security, and account management.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="p-6 shadow-elegant">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-semibold hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {/* Still Have Questions CTA */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to help you with any inquiries.
            </p>
            <Button asChild size="lg" className="transition-all duration-300 hover:shadow-elegant">
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
