import ExportPlantaoModal from '@/components/ExportPlantaoModal';
import ExportPontoModal from '@/components/ExportPontoModal';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Link, Tabs } from 'expo-router';
import React, { useState } from 'react';
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
  onPress?: () => void;
}) {
  const { href, onPress, ...iconProps } = props;
  const icon = (
    <Pressable onPress={!href ? onPress : undefined}>
      {({ pressed }) => (
        <FontAwesome5
          size={20}
          style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          {...iconProps}
        />
      )}
    </Pressable>
  );
  if (href) {
    return (
      <Link href={href as any} asChild>
        {icon}
      </Link>
    );
  }
  return icon;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [exportPontoVisible, setExportPontoVisible] = useState(false);
  const [exportPlantaoVisible, setExportPlantaoVisible] = useState(false);

  return (
    <>
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
          headerRight: () => (
            <>
              <HeaderButton name="upload" color={Colors[colorScheme ?? 'light'].text} onPress={() => setExportPontoVisible(true)} />
              <HeaderButton name="cog" color={Colors[colorScheme ?? 'light'].text} href="/config-ponto" />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="plantao"
        options={{
          title: 'Plantão',
          tabBarIcon: ({ color }) => <TabBarIcon name="phone-alt" color={color} />,
          headerRight: () => (
            <>
              <HeaderButton name="upload" color={Colors[colorScheme ?? 'light'].text} onPress={() => setExportPlantaoVisible(true)} />
              <HeaderButton name="cog" color={Colors[colorScheme ?? 'light'].text} href='/config-plantao' />
            </>
          ),
        }}
      />
    </Tabs>
    <ExportPontoModal
      visible={exportPontoVisible}
      onClose={() => setExportPontoVisible(false)}
    />
    <ExportPlantaoModal
      visible={exportPlantaoVisible}
      onClose={() => setExportPlantaoVisible(false)}
    />
    </>
  );
}
