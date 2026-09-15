import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogContent,
    DialogBody,
    DialogActions,
    Button,
    tokens,
} from '@fluentui/react-components';

export interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    disabled?: boolean;
    /** Optional width control */
    maxWidth?: string | number;
    /** Predefined sizing shortcut; ignored if maxWidth provided */
    size?: 'small' | 'medium' | 'large';
    /** Prevent message text wrapping (may overflow on very small screens) */
    nowrap?: boolean;
}

const useStyles = makeStyles({
    messageContainer: {
        width: '100%',
        display: 'block',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: '1.4',
        flexGrow: 1,
        minWidth: 0,
    },
    messageInner: {
        width: '100%',
        display: 'block',
        margin: 0,
    },
    body: {
        width: '100%',
        flexGrow: 1,
        display: 'block',
    },
    actions: {
        marginTop: tokens.spacingVerticalM,
    },
});

// Reusable confirmation dialog following Fluent UI v9 patterns.
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title = 'Confirm',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    disabled = false,
    maxWidth,
    size = 'small',
    nowrap = false,
}) => {
    const widthBySize: Record<string, string> = {
        small: '420px',
        medium: '560px',
        large: '680px',
    };
    const surfaceMaxWidth = maxWidth ?? widthBySize[size] ?? widthBySize.small;
    const styles = useStyles();

    return (
        <Dialog open={open} onOpenChange={(_, data) => { if (!data.open && !loading) onCancel(); }}>
            <DialogSurface style={{ maxWidth: surfaceMaxWidth, width: '100%' }}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogBody className={styles.body}>
                        <div className={styles.messageContainer} style={nowrap ? { whiteSpace: 'nowrap', overflowX: 'hidden' } : undefined}>
                            {typeof message === 'string' ? (
                                <div className={styles.messageInner}>{message}</div>
                            ) : (
                                <div className={styles.messageInner}>{message}</div>
                            )}
                        </div>
                    </DialogBody>
                    <DialogActions className={styles.actions}>
                        <Button appearance="secondary" onClick={onCancel} disabled={loading || disabled}>{cancelLabel}</Button>
                        <Button appearance="primary" onClick={onConfirm} disabled={loading || disabled}>
                            {loading ? `${confirmLabel}...` : confirmLabel}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </DialogSurface>
        </Dialog>
    );
};

export default ConfirmDialog;
