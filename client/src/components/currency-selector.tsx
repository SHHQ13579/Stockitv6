import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CurrencySelectorProps {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

const currencies = [
  { code: "GBP", name: "£ British Pound", symbol: "£" },
  { code: "USD", name: "$ US Dollar", symbol: "$" },
  { code: "EUR", name: "€ Euro", symbol: "€" },
  { code: "AUD", name: "$ Australian Dollar", symbol: "$" },
];

export default function CurrencySelector({ currency, onCurrencyChange }: CurrencySelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-base font-medium text-slate-700">Currency:</Label>
      <Select value={currency} onValueChange={onCurrencyChange}>
        <SelectTrigger className="w-44 h-10 text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((curr) => (
            <SelectItem key={curr.code} value={curr.code} className="text-base">
              {curr.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
