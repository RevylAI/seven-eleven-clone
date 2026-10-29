import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from 'convex/react';
import UserRound from 'lucide-react-native/icons/user-round';
import Store from 'lucide-react-native/icons/store';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import ShoppingBag from 'lucide-react-native/icons/shopping-bag';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import { api } from '../../convex/_generated/api';
import {
  Button,
  Header,
  Field,
  ErrorText,
  Brand,
  ui,
  colors,
} from '../components/ui';
import { useStore, friendlyError } from '../lib/store';
export function Account({
  onBack,
  onManager,
  onOrders,
}: {
  onBack: () => void;
  onManager: () => void;
  onOrders: () => void;
}) {
  const { me, resetGuest, setNotice } = useStore();
  const { signIn, signOut } = useAuthActions();
  const updateName = useMutation(api.profiles.updateName);
  const [mode, setMode] = useState<
    'menu' | 'signin' | 'signup' | 'manager' | 'edit'
  >('menu');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function go(next: typeof mode) {
    setError('');
    setPassword('');
    setMode(next);
  }
  async function submit() {
    setError('');
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 12 || password.length > 128) {
      setError('Use a password with 12–128 characters.');
      return;
    }
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Enter your name (at least 2 characters).');
      return;
    }
    setBusy(true);
    try {
      await signIn('password', {
        flow: mode === 'signup' ? 'signUp' : 'signIn',
        email: normalized,
        password,
        name: name.trim(),
      });
      setPassword('');
      setMode('menu');
      setNotice('You’re signed in. Welcome back!');
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }
  const row = (
    title: string,
    Icon: any,
    action: () => void,
    detail?: string,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={action}
      style={[ui.card, ui.row, { paddingVertical: 19 }]}
    >
      <Icon color={colors.green} size={21} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={ui.label}>{title}</Text>
        {detail && (
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
            {detail}
          </Text>
        )}
      </View>
      <ChevronRight size={18} color={colors.muted} />
    </Pressable>
  );
  if (mode === 'edit' && me)
    return (
      <KeyboardAvoidingView
        style={ui.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header title="Edit profile" onBack={() => go('menu')} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={ui.content}
        >
          <Field
            label="Your name"
            value={name}
            onChangeText={setName}
            maxLength={60}
          />
          <ErrorText text={error} />
          <Button
            title="Save changes"
            busy={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await updateName({ name });
                go('menu');
                setNotice('Profile updated');
              } catch (e) {
                setError(friendlyError(e));
              } finally {
                setBusy(false);
              }
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  if (mode !== 'menu' && !me)
    return (
      <KeyboardAvoidingView
        style={ui.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header
          title={mode === 'manager' ? 'Store manager' : 'Your account'}
          onBack={() => go('menu')}
        />
        <ScrollView
          contentContainerStyle={[ui.content, { paddingTop: 30 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Brand />
          <Text style={ui.title}>
            {mode === 'signup'
              ? 'Good to have you here.'
              : mode === 'manager'
              ? 'Welcome, store team.'
              : 'Welcome back.'}
          </Text>
          <Text style={[ui.body, { marginBottom: 8 }]}>
            {mode === 'manager'
              ? 'Sign in with your authorized store manager account.'
              : mode === 'signup'
              ? 'Create your shopper profile and keep all your orders in one place.'
              : 'Sign in for more convenience, every day.'}
          </Text>
          {mode === 'signup' && (
            <Field
              label="Your name"
              placeholder="First and last name"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              maxLength={60}
            />
          )}
          <Field
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Password"
            placeholder="12–128 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <ErrorText text={error} />
          <Button
            busy={busy}
            title={mode === 'signup' ? 'Create shopper account' : 'Sign in'}
            onPress={submit}
          />
          {mode !== 'manager' && (
            <Button
              secondary
              title={
                mode === 'signup'
                  ? 'Already a member? Sign in'
                  : 'New here? Create an account'
              }
              onPress={() => go(mode === 'signup' ? 'signin' : 'signup')}
            />
          )}
          <Text style={{ fontSize: 11, color: colors.muted, lineHeight: 17 }}>
            Demo accounts only. Email verification and password recovery are not
            yet available.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  return (
    <View style={ui.screen}>
      <Header title="Account" onBack={onBack} />
      <ScrollView contentContainerStyle={ui.content}>
        <View
          style={{
            width: 66,
            height: 66,
            borderRadius: 35,
            backgroundColor: colors.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
          }}
        >
          <UserRound color={colors.green} size={30} />
        </View>
        <Text style={ui.title}>
          {me ? `Hi, ${me.name}.` : 'Hello, neighbor.'}
        </Text>
        <Text style={ui.body}>
          {me ? me.email : 'Your everyday favorites. A little more convenient.'}
        </Text>
        {me ? (
          <View style={[ui.pill, { alignSelf: 'flex-start' }]}>
            <Text style={ui.pillText}>
              {me.role === 'manager' ? 'STORE MANAGER' : 'SHOPPER'}
            </Text>
          </View>
        ) : (
          <>
            <Button title="Sign in" onPress={() => go('signin')} />
            <Button
              secondary
              title="Create an account"
              onPress={() => go('signup')}
            />
          </>
        )}
        {row(
          'Your orders',
          ShoppingBag,
          onOrders,
          me
            ? 'Track your pickups and view past orders'
            : 'Guest orders on this device',
        )}
        {me &&
          row(
            'Edit profile',
            UserRound,
            () => {
              setName(me.name);
              go('edit');
            },
            'Make yourself at home',
          )}
        {row(
          'Store manager',
          Store,
          me?.role === 'manager'
            ? onManager
            : () =>
                me
                  ? setError(
                      'This account is a shopper. A store administrator must grant manager access.',
                    )
                  : go('manager'),
          me?.role === 'manager'
            ? 'Orders, inventory and store overview'
            : 'Authorized store accounts only',
        )}
        <ErrorText text={error} />
        {me && (
          <Button
            secondary
            busy={busy}
            title="Sign out"
            onPress={async () => {
              setBusy(true);
              try {
                await signOut();
                await resetGuest();
                setNotice('You’re signed out');
                go('menu');
              } catch (e) {
                setError(friendlyError(e));
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <ShieldCheck color={colors.muted} size={17} />
          <Text style={[ui.body, { flex: 1, fontSize: 11 }]}>
            Seven Eleven Clone is an independent demo, not affiliated with
            7-Eleven. No real purchases are made.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
