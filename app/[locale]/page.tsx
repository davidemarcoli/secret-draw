import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

export default function Home() {
  const t = useTranslations('Index');

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
      <div className="space-y-4 max-w-2xl">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
          <Gift className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          {t('title')}
        </h1>
        <p className="text-xl text-muted-foreground whitespace-pre-line">
          {t('description')}
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
          <Link href="/create">{t('createEvent')}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
          <Link href="/events">{t('viewEvents')}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-4xl text-left">
        <div className="space-y-2">
          <h3 className="font-bold text-lg">{t('steps.1.title')}</h3>
          <p className="text-muted-foreground">{t('steps.1.description')}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">{t('steps.2.title')}</h3>
          <p className="text-muted-foreground">{t('steps.2.description')}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">{t('steps.3.title')}</h3>
          <p className="text-muted-foreground">{t('steps.3.description')}</p>
        </div>
      </div>
    </div>
  );
}
