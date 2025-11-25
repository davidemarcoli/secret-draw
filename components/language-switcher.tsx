"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
    const t = useTranslations("LanguageSwitcher");
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const onSelectChange = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <Select defaultValue={locale} onValueChange={onSelectChange}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("label")} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
        </Select>
    );
}
