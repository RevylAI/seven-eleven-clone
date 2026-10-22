import React from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TextInputProps,
} from 'react-native';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
export const colors = {
  green: '#007F5B',
  ink: '#111512',
  muted: '#727772',
  line: '#EBEEEB',
  soft: '#F4F6F3',
  orange: '#F47721',
};
export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
  busy = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        secondary && ui.secondary,
        (disabled || busy) && { opacity: 0.45 },
        pressed && { opacity: 0.75 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? colors.ink : 'white'} />
      ) : (
        <Text style={[ui.buttonText, secondary && { color: colors.ink }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
export function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={ui.header}>
      <View style={{ width: 44 }}>
        {onBack && (
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={onBack}
            style={ui.icon}
          >
            <ChevronLeft color={colors.ink} />
          </Pressable>
        )}
      </View>
      <Text style={ui.headerTitle}>{title}</Text>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8, marginBottom: 18 }}>
      <Text style={ui.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#9A9F9A"
        style={ui.input}
        {...props}
      />
    </View>
  );
}
export function Empty({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={ui.empty}>
      <Text style={ui.title}>{title}</Text>
      <Text style={[ui.body, { textAlign: 'center' }]}>{body}</Text>
      {children}
    </View>
  );
}
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <View style={[ui.brand, small && { width: 33, height: 38 }]}>
      <Text
        style={{
          fontSize: small ? 26 : 34,
          fontWeight: '900',
          color: '#EF572B',
          lineHeight: small ? 29 : 36,
        }}
      >
        7
      </Text>
      <Text
        style={{
          fontSize: small ? 5 : 7,
          fontWeight: '900',
          color: colors.green,
          letterSpacing: 0.5,
        }}
      >
        ELEVEN
      </Text>
    </View>
  );
}
export function ErrorText({ text }: { text: string }) {
  return text ? (
    <Text
      accessibilityRole="alert"
      style={{
        color: '#B32C32',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
      }}
    >
      {text}
    </Text>
  ) : null;
}
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 20, gap: 18, paddingBottom: 32 },
  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  body: { fontSize: 14, lineHeight: 21, color: colors.muted },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink },
  button: {
    minHeight: 52,
    borderRadius: 28,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  buttonText: { color: 'white', fontSize: 15, fontWeight: '700' },
  secondary: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D8DDD8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDE2DC',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: '#FFF',
    minHeight: 52,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  icon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFF',
  },
  empty: { padding: 32, paddingTop: 80, gap: 18, alignItems: 'center' },
  brand: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    width: 43,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EDF0ED',
  },
  divider: { height: 1, backgroundColor: colors.line },
  pill: {
    backgroundColor: '#E6F4EC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.green },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: colors.line,
    gap: 14,
    backgroundColor: 'white',
  },
});
