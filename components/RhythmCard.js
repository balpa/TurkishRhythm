import { View, Text, StyleSheet, Image } from 'react-native'
import React, { memo } from 'react'
import ExpandableCard from './ExpandableCard'

const RhythmCard = ({ rhythmName, rhythmTime, color, imageURI, infoText, isFavorite, onToggleFavorite }) => {
  const renderBullets = (text, accentColor) => {
    const items = text.split('*').filter(s => s.trim())
    return items.map((item, i) => (
      <View key={i} style={styles.bulletRow}>
        <View style={[styles.bulletDot, { backgroundColor: accentColor }]} />
        <Text style={styles.bulletText}>{item.trim()}</Text>
      </View>
    ))
  }

  const headerContent = (
    <>
      <View style={styles.badgeOuter}>
        <Text style={styles.timeText}>{rhythmTime}</Text>
      </View>
      <View style={styles.titleBlock}>
        <Text numberOfLines={1} style={styles.nameText}>{rhythmName}</Text>
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
      {infoText ? renderBullets(infoText, color) : null}
    </>
  )

  return (
    <ExpandableCard
      color={color}
      expandHeight={320}
      headerContent={headerContent}
      bodyContent={bodyContent}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      accessibilityLabel={`${rhythmName} ${rhythmTime} rhythm card`}
    />
  )
}

export default memo(RhythmCard)

const styles = StyleSheet.create({
  badgeOuter: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  timeText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFF5E6',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    justifyContent: 'center',
  },
  image: {
    height: undefined,
    width: '92%',
    alignSelf: 'center',
    aspectRatio: 2.7,
    borderRadius: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
    opacity: 0.7,
  },
  bulletText: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
    fontSize: 13.5,
    fontWeight: '500',
  },
})
