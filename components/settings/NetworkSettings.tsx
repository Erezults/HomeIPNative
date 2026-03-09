import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNetwork } from '@/hooks/useNetwork'
import { useFieldAutoSave } from '@/hooks/useAutoSave'
import { supabase } from '@/lib/supabase'
import { isValidIP } from '@/lib/ip-utils'
import { Input } from '@/components/ui/Input'
import { SaveIndicator } from '@/components/ui/SaveIndicator'

type FieldName = 'name' | 'subnet' | 'gateway' | 'dhcp_range_start' | 'dhcp_range_end' | 'dns_primary' | 'dns_secondary'

const FIELD_VALIDATORS: Record<FieldName, (v: string) => boolean> = {
  name: () => true,
  subnet: (v) => !v || isValidIP(v),
  gateway: (v) => !v || isValidIP(v),
  dhcp_range_start: (v) => !v || isValidIP(v),
  dhcp_range_end: (v) => !v || isValidIP(v),
  dns_primary: (v) => !v || isValidIP(v),
  dns_secondary: (v) => !v || isValidIP(v),
}

export function NetworkSettings() {
  const { isDark } = useTheme()
  const { t, isRTL } = useLanguage()
  const { network, refetch } = useNetwork()
  const { fieldStatus, triggerSave } = useFieldAutoSave(500)

  const [form, setForm] = useState({
    name: '',
    subnet: '',
    gateway: '',
    dhcp_range_start: '',
    dhcp_range_end: '',
    dns_primary: '',
    dns_secondary: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (network) {
      setForm({
        name: network.name || '',
        subnet: network.subnet || '',
        gateway: network.gateway || '',
        dhcp_range_start: network.dhcp_range_start || '',
        dhcp_range_end: network.dhcp_range_end || '',
        dns_primary: network.dns_primary || '',
        dns_secondary: network.dns_secondary || '',
      })
    }
  }, [network])

  const saveField = useCallback(async (field: FieldName, value: string): Promise<boolean> => {
    if (!network) return false
    const { error } = await supabase
      .from('networks')
      .update({ [field]: value })
      .eq('id', network.id)
    if (error) {
      console.error(`Failed to save ${field}:`, error.message)
      setErrors((prev) => ({ ...prev, [field]: error.message }))
    } else {
      refetch()
    }
    return !error
  }, [network, refetch])

  const updateField = useCallback((field: FieldName, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    const isValid = FIELD_VALIDATORS[field](value)
    if (!isValid) {
      setErrors((prev) => ({ ...prev, [field]: t.device.ipInvalid }))
      return
    }

    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })

    if (value) {
      triggerSave(field, () => saveField(field, value))
    }
  }, [t, triggerSave, saveField])

  const colors = {
    background: isDark ? '#111122' : '#f9fafb',
    cardBg: isDark ? '#16213e' : '#ffffff',
    text: isDark ? '#e2e8f0' : '#1e293b',
    muted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#1e293b' : '#e2e8f0',
    sectionBg: isDark ? '#1a1a2e' : '#f1f5f9',
  }

  const renderField = (
    field: FieldName,
    label: string,
    placeholder: string,
    isIP: boolean = true
  ) => (
    <View style={styles.fieldContainer} key={field}>
      <View style={[styles.fieldHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.fieldLabel, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
          {label}
        </Text>
        <SaveIndicator status={fieldStatus[field] || 'idle'} />
      </View>
      <Input
        value={form[field]}
        onChangeText={(val) => updateField(field, val)}
        placeholder={placeholder}
        keyboardType={isIP ? 'numeric' : 'default'}
        error={errors[field]}
        style={isIP ? { textAlign: 'left', writingDirection: 'ltr' } : undefined}
      />
    </View>
  )

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        {renderField('name', t.settings.networkName, '\u05d4\u05e8\u05e9\u05ea \u05d4\u05d1\u05d9\u05ea\u05d9\u05ea', false)}
        {renderField('subnet', t.settings.subnet, '192.168.1.0/24')}
        {renderField('gateway', t.settings.gateway, '192.168.1.1')}

        {/* DHCP Range */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.sectionLabel, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {t.settings.dhcpRange}
          </Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <View style={[styles.fieldHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.smallLabel, { color: colors.muted }]}>{t.settings.dhcpStart}</Text>
                <SaveIndicator status={fieldStatus['dhcp_range_start'] || 'idle'} />
              </View>
              <Input
                value={form.dhcp_range_start}
                onChangeText={(val) => updateField('dhcp_range_start', val)}
                placeholder="192.168.1.100"
                keyboardType="numeric"
                error={errors.dhcp_range_start}
                style={{ textAlign: 'left', writingDirection: 'ltr' }}
              />
            </View>
            <View style={styles.halfField}>
              <View style={[styles.fieldHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.smallLabel, { color: colors.muted }]}>{t.settings.dhcpEnd}</Text>
                <SaveIndicator status={fieldStatus['dhcp_range_end'] || 'idle'} />
              </View>
              <Input
                value={form.dhcp_range_end}
                onChangeText={(val) => updateField('dhcp_range_end', val)}
                placeholder="192.168.1.254"
                keyboardType="numeric"
                error={errors.dhcp_range_end}
                style={{ textAlign: 'left', writingDirection: 'ltr' }}
              />
            </View>
          </View>
        </View>

        {/* DNS */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <View style={[styles.fieldHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t.settings.dnsPrimary}</Text>
              <SaveIndicator status={fieldStatus['dns_primary'] || 'idle'} />
            </View>
            <Input
              value={form.dns_primary}
              onChangeText={(val) => updateField('dns_primary', val)}
              placeholder="8.8.8.8"
              keyboardType="numeric"
              error={errors.dns_primary}
              style={{ textAlign: 'left', writingDirection: 'ltr' }}
            />
          </View>
          <View style={styles.halfField}>
            <View style={[styles.fieldHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t.settings.dnsSecondary}</Text>
              <SaveIndicator status={fieldStatus['dns_secondary'] || 'idle'} />
            </View>
            <Input
              value={form.dns_secondary}
              onChangeText={(val) => updateField('dns_secondary', val)}
              placeholder="8.8.4.4"
              keyboardType="numeric"
              error={errors.dns_secondary}
              style={{ textAlign: 'left', writingDirection: 'ltr' }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
})
