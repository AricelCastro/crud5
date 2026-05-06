
import * as React from 'react';
import { Portal, Dialog, Button, Text, TextInput, HelperText } from 'react-native-paper';

export default function ConfirmDeleteDialog({
  visible,
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  const [secret, setSecret] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!visible) {
      setSecret('');
      setError('');
    }
  }, [visible]);

  const onPressConfirm = async () => {
    setError('');
    const ok = await onConfirm?.(secret);
    if (!ok) setError('Contraseña o PIN incorrecto.');
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} style={{ borderRadius: 16 }}>
        <Dialog.Title>{title ?? 'Confirmar eliminación'}</Dialog.Title>
        <Dialog.Content>
          {body ? (
            <Text style={{ marginBottom: 10 }}>{body}</Text>
          ) : null}
          <TextInput
            label="Reingresa contraseña o PIN"
            mode="outlined"
            secureTextEntry
            value={secret}
            onChangeText={setSecret}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel}>Cancelar</Button>
          <Button mode="contained" onPress={onPressConfirm} disabled={!secret.trim()}>
            {confirmLabel ?? 'Confirmar'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
