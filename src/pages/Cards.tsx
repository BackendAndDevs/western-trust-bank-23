import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Lock,
  Unlock,
  Ban,
  Check
} from "lucide-react";
import { useCards } from "@/hooks/useCards";
import PageLayout from "@/components/PageLayout";

const Cards = () => {
  const { cards, loading, updateCardStatus } = useCards();

  const handleCardAction = async (cardId: string, status: 'active' | 'frozen' | 'deactivated') => {
    try {
      await updateCardStatus(cardId, status);
    } catch (error) {
      console.error('Error updating card status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'frozen': return 'bg-blue-100 text-blue-800';
      case 'deactivated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCardTypeColor = (type: string) => {
    return type === 'credit' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700';
  };

  const maskCardNumber = (cardNumber: string) => {
    return `•••• •••• •••• ${cardNumber.slice(-4)}`;
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Cards</CardTitle>
            <CardDescription>Manage your debit and credit cards</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading cards...</p>
              </div>
            ) : cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="space-y-4">
                    {/* Card Visual */}
                    <div className={`${getCardTypeColor(card.card_type)} p-6 rounded-xl shadow-lg text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <CreditCard className="w-8 h-8" />
                          <Badge className="bg-white/20 text-white border-white/40">
                            {card.card_type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-4">
                          <div className="font-mono text-lg tracking-wider">
                            {maskCardNumber(card.card_number)}
                          </div>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs opacity-70">Expires</p>
                              <p className="font-mono">{card.expiry_date}</p>
                            </div>
                            <Badge className={getStatusColor(card.card_status)}>
                              {card.card_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="space-y-2">
                      {card.card_status === 'active' && (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleCardAction(card.id, 'frozen')}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Freeze Card
                        </Button>
                      )}
                      {card.card_status === 'frozen' && (
                        <>
                          <Button
                            className="w-full"
                            onClick={() => handleCardAction(card.id, 'active')}
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Unfreeze Card
                          </Button>
                          <Button
                            className="w-full"
                            variant="destructive"
                            onClick={() => handleCardAction(card.id, 'deactivated')}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Deactivate
                          </Button>
                        </>
                      )}
                      {card.card_status === 'deactivated' && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <Ban className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Card deactivated. Contact support to reactivate.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No cards found</p>
                <p className="text-sm text-muted-foreground">
                  Contact your branch to request a new card
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Cards;
