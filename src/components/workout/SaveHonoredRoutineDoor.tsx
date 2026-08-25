'use client';

/**
 * Confirm-gated save for a named routine they recognize (`.960`).
 * Not the Today red Start. Replace is explicit — no silent wipe.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  name: string;
  onNameChange: (name: string) => void;
  replaceExisting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SaveHonoredRoutineDoor({
  open,
  name,
  onNameChange,
  replaceExisting,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-md border-2 border-border bg-card">
        <DialogHeader>
          <DialogTitle>
            {replaceExisting
              ? t('honorReplaceTitle', { defaultValue: 'Replace this routine?' })
              : t('honorSaveTitle', { defaultValue: 'Save this routine?' })}
          </DialogTitle>
          <DialogDescription>
            {replaceExisting
              ? t('honorReplaceDesc', {
                  name,
                  defaultValue: '“{{name}}” is already yours. Confirm to update it. Start will use this list.',
                })
              : t('honorSaveDesc', {
                  defaultValue:
                    'Keep the lifts you just did (or typed) under a name you recognize. Start uses it — Wednesday from logs does not replace it.',
                })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="honor-routine-name">
            {t('honorRoutineName', { defaultValue: 'Routine name' })}
          </Label>
          <Input
            id="honor-routine-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="min-h-[44px]"
            data-testid="save-honored-name"
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            className="min-h-[44px] w-full tap-target"
            variant="outline"
            onClick={onConfirm}
            data-testid="save-honored-confirm"
          >
            {replaceExisting
              ? t('honorReplaceConfirm', { defaultValue: 'Replace routine' })
              : t('honorSaveConfirm', { defaultValue: 'Save routine' })}
          </Button>
          <Button
            type="button"
            className="min-h-[44px] w-full tap-target"
            variant="ghost"
            onClick={onCancel}
          >
            {t('honorSaveCancel', { defaultValue: 'Cancel' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
