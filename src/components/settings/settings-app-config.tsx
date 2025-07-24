import { AppExternalLink, AppExternalLinkProps } from '@/components/app-external-link'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { AppConfig } from '@/src/constants/app-config'

export function SettingsAppConfig() {
  return (
    <AppView>
      <AppText variant="titleMedium">App Config</AppText>
      <AppText>
        Name: <AppText>{AppConfig.name}</AppText>
      </AppText>
      <AppText>
        URL: <AppExternalLink href={AppConfig.uri as AppExternalLinkProps['href']}>{AppConfig.uri}</AppExternalLink>
      </AppText>
    </AppView>
  )
}
