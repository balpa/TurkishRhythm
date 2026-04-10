import { View, Text, StyleSheet, Image } from 'react-native'
import React, { memo } from 'react'
import ExpandableCard from './ExpandableCard'

const MakamCard = ({ makamName, color, imageURI, makamInfo, isFavorite, onToggleFavorite }) => {
  const renderFormattedInfo = (info, accentColor) => {
    const sections = info.split('*').filter(s => s.trim())
    return sections.map((section, i) => {
      const colonIdx = section.indexOf(':')
      if (colonIdx === -1) return <Text key={i} style={styles.infoBody}>{section.trim()}</Text>

      const label = section.slice(0, colonIdx).trim()
      const body = section.slice(colonIdx + 1).trim()

      return (
        <View key={i} style={styles.infoSection}>
          <View style={styles.labelRow}>
            <View style={[styles.labelDot, { backgroundColor: accentColor }]} />
            <Text style={styles.infoLabel}>{label}</Text>
          </View>
          <Text style={styles.infoBody}>{body}</Text>
          {i < sections.length - 1 && <View style={styles.divider} />}
        </View>
      )
    })
  }

  const headerContent = (
    <>
      <View style={styles.decoWrap}>
        <View style={styles.decoRingOuter} />
        <View style={[styles.decoFill, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        <View style={[styles.decoDiamond, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
        <View style={styles.decoCenter} />
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.nameText}>{makamName}</Text>
      </View>
    </>
  )

  const bodyContent = (
    <>
      {imageURI && (
        <View style={styles.imageWrap}>
          <Image source={imageURI} style={styles.image} />
        </View>
      )}
      {renderFormattedInfo(makamInfo, color)}
    </>
  )

  return (
    <ExpandableCard
      color={color}
      expandHeight={420}
      headerContent={headerContent}
      bodyContent={bodyContent}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      accessibilityLabel={`${makamName} makam card`}
    />
  )
}

export default memo(MakamCard)

const styles = StyleSheet.create({
  decoWrap: {
    width: 48,
    height: 48,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decoRingOuter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    opacity: 0.55,
  },
  decoFill: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  decoDiamond: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
  decoCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  titleBlock: {
    flex: 1,
  },
  nameText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFF5E6',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageWrap: {
    height: 100,
    marginBottom: 10,
    justifyContent: 'center',
  },
  image: {
    height: undefined,
    width: '92%',
    alignSelf: 'center',
    aspectRatio: 2.7,
    borderRadius: 8,
  },
  infoSection: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#fff',
  },
  infoBody: {
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 21,
    fontSize: 13.5,
    fontWeight: '500',
    paddingLeft: 13,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
})
