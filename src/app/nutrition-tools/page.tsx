
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAdvancedNutritionAdvice, GetAdvancedNutritionAdviceInput } from '@/ai/flows/get-advanced-nutrition-advice';
import { Sparkles, Loader2, Bot, Pill, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { Markdown } from '@/components/markdown';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Tool = 'supplements' | 'recipe' | 'meal_prep';

export default function NutritionToolsPage() {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (tool: Tool) => {
    setActiveTool(tool);
    setIsLoading(true);
    setAiResponse(null);

    let input: GetAdvancedNutritionAdviceInput = { requestType: tool };

    if (tool === 'recipe') {
      if (!ingredients) {
        toast({ variant: 'destructive', title: 'Please enter your ingredients.' });
        setIsLoading(false);
        return;
      }
      input.ingredients = ingredients;
    }

    if (tool === 'meal_prep') {
        if (!mealPlan) {
          toast({ variant: 'destructive', title: 'Please enter a meal plan.' });
          setIsLoading(false);
          return;
        }
        input.mealPlan = mealPlan;
      }

    try {
      const result = await getAdvancedNutritionAdvice(input);
      setAiResponse(result.response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Failed to get a response from the AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (!activeTool) return null;

    if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4">Our AI is working on your request...</p>
         </div>
      )
    }

    if (aiResponse) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Sparkles />
                        AI Response
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Markdown content={aiResponse} />
                </CardContent>
            </Card>
        )
    }

    return null;
  }

  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Pill />Supplement Suggestions</CardTitle>
                    <CardDescription>Get general advice on supplements that may support your fitness goals.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTitle>Disclaimer</AlertTitle>
                        <AlertDescription>
                            This is not medical advice. Always consult a healthcare professional before taking new supplements.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => handleGenerate('supplements')} disabled={isLoading && activeTool === 'supplements'} className="w-full">
                        {isLoading && activeTool === 'supplements' ? <Loader2 className="animate-spin"/> : <Sparkles className="mr-2" />}
                        Get Advice
                    </Button>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><UtensilsCrossed />Recipe Recommender</CardTitle>
                    <CardDescription>Have ingredients but no ideas? Let our AI chef create a recipe for you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        placeholder="e.g., chicken breast, rice, broccoli, soy sauce"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={() => handleGenerate('recipe')} disabled={isLoading && activeTool === 'recipe'} className="w-full">
                        {isLoading && activeTool === 'recipe' ? <Loader2 className="animate-spin"/> : <Sparkles className="mr-2" />}
                        Generate Recipe
                    </Button>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><ShoppingCart />Meal Prep Planner</CardTitle>
                    <CardDescription>Turn a simple meal plan into an organized shopping list.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Textarea 
                        placeholder="e.g., Monday: Chicken and rice. Tuesday: Salmon and quinoa."
                        value={mealPlan}
                        onChange={(e) => setMealPlan(e.target.value)}
                    />
                </CardContent>
                <CardFooter>
                     <Button onClick={() => handleGenerate('meal_prep')} disabled={isLoading && activeTool === 'meal_prep'} className="w-full">
                        {isLoading && activeTool === 'meal_prep' ? <Loader2 className="animate-spin"/> : <Sparkles className="mr-2" />}
                        Create Shopping List
                    </Button>
                </CardFooter>
            </Card>
        </div>

        {renderResult()}

        {!activeTool && (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-16 border-2 border-dashed rounded-lg">
                <Bot className="h-16 w-16" />
                <p className="mt-4 text-lg">Your AI-generated results will appear here.</p>
                <p className="text-sm">Select a tool above to get started.</p>
            </div>
        )}
    </div>
  );
}
