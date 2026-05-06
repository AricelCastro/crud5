import * as React from 'react';
import { View } from 'react-native';
import { Appbar, Snackbar } from 'react-native-paper';
import useAlumnoFormController from '../Hooks/useAlumnosForm';
import AlumnoForm from '../Components/AlumnosForm';
import { AuthContext } from '../Services/AuthContext';
import ConfirmDeleteDialog from '../Components/ConfirmDeleteModal';

export default function FormAlumnos() {
  const { id, form, onChange, onSave, onCancel, saving, invalid, msg, setMsg } = useAlumnoFormController();
  const auth = React.useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider no envuelve la app.');
  const { logout, verifyActionSecret } = auth;

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const onRequestSave = async () => {
    if (!id) {
      await onSave();
      return;
    }
    setConfirmOpen(true);
  };

  const onConfirmUpdate = async (secret) => {
    if (!verifyActionSecret(secret)) return false;
    setConfirmOpen(false);
    await onSave();
    return true;
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={onCancel} />
        <Appbar.Content title={id ? 'Editar alumno' : 'Nuevo alumno'} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>

      <AlumnoForm
        form={form}
        onChange={onChange}
        onSave={onRequestSave}
        onCancel={onCancel}
        saving={saving}
        invalid={invalid}
      />

      <ConfirmDeleteDialog
        visible={confirmOpen}
        title="Confirmar actualización"
        body="Vas a actualizar este registro. Reingresa tu contraseña o PIN para continuar."
        confirmLabel="Actualizar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onConfirmUpdate}
      />

      <Snackbar visible={!!msg} onDismiss={() => setMsg('')}>
        {msg}
      </Snackbar>
    </View>
  );
}
