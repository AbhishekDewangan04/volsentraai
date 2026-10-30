import { useI18n } from "@/lib/i18n";

/** Mobile tab label — translated where a key exists, English otherwise. */
export default function MobileNavLabel({ item }) {
    const { t } = useI18n();
    return (
        <span className="mono uppercase tracking-[0.1em]">{item.key ? t(item.key) : item.label}</span>
    );
}