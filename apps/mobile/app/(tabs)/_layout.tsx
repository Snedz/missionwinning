import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme';

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? colors.emerald : colors.textMuted, fontSize: 12, fontWeight: '700' }}>
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.navyElevated,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.emerald,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarLabel: ({ focused }) => <TabLabel label="Today" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarLabel: ({ focused }) => <TabLabel label="Coach" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarLabel: ({ focused }) => <TabLabel label="Account" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
