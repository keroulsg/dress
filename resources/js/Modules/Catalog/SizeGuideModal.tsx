import { Badge } from '../../Components/UI/Badge';
import { Modal, ModalContent, ModalDescription, ModalTitle } from '../../Components/UI/Modal';
import { cn } from '../../Lib/utils';

export interface SizeGuideSize {
    size_code: string;
    bust: string | null;
    waist: string | null;
    hips: string | null;
    length: string | null;
    is_available: boolean;
}

export interface SizeGuideModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sizes: SizeGuideSize[];
}

export function SizeGuideModal({ open, onOpenChange, sizes }: SizeGuideModalProps) {
    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="max-w-xl">
                <ModalTitle className="font-display text-2xl text-charcoal">Size guide</ModalTitle>
                <ModalDescription className="text-sm text-stone-muted">
                    Measurements are in centimetres (cm).
                </ModalDescription>

                {sizes.length > 0 ? (
                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-stone-line text-left text-xs uppercase tracking-luxe text-stone-muted">
                                    <th className="py-2.5 pr-4 font-medium">Size</th>
                                    <th className="py-2.5 pr-4 font-medium">Bust</th>
                                    <th className="py-2.5 pr-4 font-medium">Waist</th>
                                    <th className="py-2.5 pr-4 font-medium">Hips</th>
                                    <th className="py-2.5 pr-4 font-medium">Length</th>
                                    <th className="py-2.5 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sizes.map((size) => (
                                    <tr
                                        key={size.size_code}
                                        className={cn(
                                            'border-b border-stone-line/60',
                                            !size.is_available && 'opacity-60',
                                        )}
                                    >
                                        <td
                                            className={cn(
                                                'py-3 pr-4 font-medium text-charcoal',
                                                !size.is_available && 'line-through',
                                            )}
                                        >
                                            {size.size_code}
                                        </td>
                                        <td className="py-3 pr-4 text-stone-muted">{size.bust ? `${size.bust} cm` : '—'}</td>
                                        <td className="py-3 pr-4 text-stone-muted">{size.waist ? `${size.waist} cm` : '—'}</td>
                                        <td className="py-3 pr-4 text-stone-muted">{size.hips ? `${size.hips} cm` : '—'}</td>
                                        <td className="py-3 pr-4 text-stone-muted">
                                            {size.length ? `${size.length} cm` : '—'}
                                        </td>
                                        <td className="py-3">
                                            {size.is_available ? (
                                                <Badge tone="success">Available</Badge>
                                            ) : (
                                                <Badge tone="neutral">Unavailable</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-stone-muted">No size chart is available for this dress yet.</p>
                )}
            </ModalContent>
        </Modal>
    );
}
