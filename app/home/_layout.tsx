import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={20} style={{ marginBottom: -3 }} {...props} />;
}

function HeaderButton(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
  href?: string;
}) {
  const { href = '/modal', ...iconProps } = props;
  return (
    <Link href={href as any} asChild>
      <Pressable>
        {({ pressed }) => (
          <FontAwesome5
            size={20}
            style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            {...iconProps}
          />
        )}
      </Pressable>
    </Link>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Registro Ponto',
          tabBarIcon: ({ color }) => <TabBarIcon name="business-time" color={color} />,
          headerRight: () => <HeaderButton name="cog" color={Colors[colorScheme ?? 'light'].text} href="/config-ponto" />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Plantão',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => <HeaderButton name="cog" color={Colors[colorScheme ?? 'light'].text} />,
        }}
      />
    </Tabs>
  );
}
