"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  blockchain: z.string().min(1, "Blockchain is required"),
  wallet: z.string().min(1, "Wallet is required"),
  quantity: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val > 0, {
      message: "La quantité doit être un nombre positif",
    }),
  purchasePrice: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, {
      message: "Le prix d'achat doit être un nombre positif",
    }),
  purchaseDate: z.string().optional(),
  type: z.string().min(1, "Trade type is required"),
  narrative: z
    .string()
    .transform((val) => val.split(",").map((item) => item.trim())), // Convert string to array
  classification: z.string().min(1, "Classification is required"),
  origin: z.string().min(1, "Origin is required"),
});

type FormData = z.infer<typeof formSchema>;

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
};


export default function AddAssetDialog({
  open,
  onOpenChange,
  onAssetAdded,
  defaultTradeType, // Nouvelle propriété
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetAdded: () => void;
  defaultTradeType?: string; // Type par défaut optionnel
}) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultTradeType === "stablecoin" ? "Tether USDt" : "" || "BitcoinTEST",
      symbol: defaultTradeType === "stablecoin" ? "USDT" : "" || "BTC",
      blockchain: "" || "Unknwown",
      wallet: "" || "AAAA",
      quantity: "" || "1",
      purchasePrice: defaultTradeType === "airdrop" ? "0" : defaultTradeType === "stablecoin" ? "1" : "",
      purchaseDate: "" || getTodayDate(),
      type: defaultTradeType || "swing",
      narrative: defaultTradeType === "stablecoin" ? "stablecoin" : "",
      classification: defaultTradeType === "stablecoin" ? "stablecoin" : ["unknown"],
      origin: defaultTradeType === "airdrop" ? "airdrop" : "bought",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to add asset");
      }

      toast({ title: "Success", description: "Asset added successfully!" });
      form.reset();
      onOpenChange(false);
      onAssetAdded();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Add New Asset</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1).toLowerCase()
                        )
                      }
                      className="text-black"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Symbol */}
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="text-black"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Blockchain */}
            <FormField name="blockchain" control={form.control} render={({ field }) => (
              <FormItem >
                <FormLabel >Blockchain</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl className="text-black">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Blockchain" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="text-black">
                  <SelectItem value="unknown">Unknown</SelectItem>
                  <SelectItem value="bitcoin">Bitcoin</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                  <SelectItem value="algorand">Algorand</SelectItem>
                  <SelectItem value="aptos">Aptos</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="avalanche">Avalanche</SelectItem>
                  <SelectItem value="blast">Blast</SelectItem>
                  <SelectItem value="binance">Binance Smart Chain</SelectItem>
                  <SelectItem value="cardano">Cardano</SelectItem>
                  <SelectItem value="cosmos">Cosmos</SelectItem>
                  <SelectItem value="elrond">MultiversX (Elrond)</SelectItem>
                  <SelectItem value="fantom">Fantom</SelectItem>
                  <SelectItem value="hedera">Hedera</SelectItem>
                  <SelectItem value="injective">Injective</SelectItem>
                  <SelectItem value="near">NEAR Protocol</SelectItem>
                  <SelectItem value="optimism">Optimism</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="polkadot">Polkadot</SelectItem>
                  <SelectItem value="scroll">Scroll</SelectItem>
                  <SelectItem value="stacks">Stacks</SelectItem>
                  <SelectItem value="sui">Sui</SelectItem>
                  <SelectItem value="tron">Tron</SelectItem>
                  <SelectItem value="vechain">VeChain</SelectItem>
                  <SelectItem value="xrp">XRP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {/* Wallet */}
            <FormField name="wallet" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Wallet</FormLabel>
                <FormControl>
                  <Input className="text-black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* Quantity */}
            <FormField name="quantity" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input className="text-black" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* Purchase Price */}
            <FormField name="purchasePrice" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <Input className="text-black" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* Purchase Date */}
            <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        className="text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            {/* Trade Type */}
            <FormField name="type" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Trade Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl className="text-black">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Trade Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="swing">Swing</SelectItem>
                    <SelectItem value="trade">Trade</SelectItem>
                    <SelectItem value="stacking">Stacking</SelectItem>
                    <SelectItem value="airdrop">Airdrop</SelectItem>
                    <SelectItem value="stablecoin">Stablecoin</SelectItem>

                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {/* Narrative */}
            <FormField name="narrative" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Narrative</FormLabel>
                <FormControl>
                  <Textarea className="text-black" {...field} placeholder="Enter narratives separated by commas" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* Classification */}
            <FormField name="classification" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Classification</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl className="text-black">
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="btc">Btc</SelectItem>
                    <SelectItem value="eth">Eth</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                    <SelectItem value="injective">Injective</SelectItem>
                    <SelectItem value="large cap">Large cap ({">"} $10Billion)</SelectItem>
                    <SelectItem value="mid cap">mid cap ({">"} $1Billion)</SelectItem>
                    <SelectItem value="low cap">low cap ({">"} $250Million)</SelectItem>
                    <SelectItem value="micro cap">Micro cap</SelectItem>
                    <SelectItem value="stablecoin">Stablecoin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {/* Origin */}
            <FormField name="origin" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Origin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl className="text-black">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Origin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bought">Bought</SelectItem>
                    <SelectItem value="airdrop">Airdrop</SelectItem>
                    <SelectItem value="reward_stacking">Reward Stacking</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Add Asset</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
