import * as React from 'react';
import { View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { AuthContext } from '../Services/AuthContext';

export default function LoginScreen() {
  const auth = React.useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider no envuelve la app.');

  const { login } = auth;
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const invalid = !username.trim() || !password.trim();

  const onSubmit = async () => {
    if (invalid) {
      setMsg('Ingresa usuario y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const ok = await login(username.trim(), password);
      if (!ok) setMsg('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Card mode="elevated" style={{ borderRadius: 16 }}>
        <Card.Content style={{ gap: 14 }}>
          <Text variant="headlineSmall">Iniciar sesión</Text>
          <TextInput
            label="Usuario"
            mode="outlined"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            label="Contraseña"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button
            mode="contained"
            onPress={onSubmit}
            loading={loading}
            disabled={invalid || loading}
          >
            Iniciar sesión
          </Button>
        </Card.Content>
      </Card>

      <Snackbar visible={!!msg} onDismiss={() => setMsg('')}>
        {msg}
      </Snackbar>
    </View>
  );
}
