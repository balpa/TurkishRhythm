import { View, Text, Animated, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import MakamCard from '../components/MakamCard'


const Makams = ({language, theme}) => {

  //const B = (props) => <Text style={{fontWeight: 'bold'}}>{props.children}</Text>

  const COLOR_PALETTE_1 = ["FEF9A7","FAC213", "F77E21", "D61C4E", "990000", "FF5B00", "D4D925", "FFEE63"]

  const MAKAMS = {
    hicaz: {
      makamName: 'Hicaz',
      info: `Durağı: Dügâh perdesidir. 
Seyri: İnici-çıkıcı, bâzen de çıkıcı olarak kullanılmıştır.
Dizisi: Yerinde Hicaz dörtlüsününe Nevâ’da bir Rast beşlisinin eklenmesinden meydana gelmiştir.
Güçlüsü: Hicaz dörtlüsü ile Rast beşlisinin ek yerindeki 5. derece Nevâ perdesidir. Üzerinde Rast çeşnisi ile yarım karar yapılır.
Donanımı: Si için bakiye bemolü, fa ve do için bakiye diyezi donanıma yazılır.
Perdelerin T.M.deki isimleri: Dügâh, Dik Kürdi, Nim Hicaz, Nevâ, Hüseyni, Eviç, Gerdaniye ve Muhayyer’dir.
Yedeni: 2.çizgideki sol Rast perdesidir (Bâzı klâsiklerde nâdir de olasa Nim Zirgüle kullanılmıştır).
Dizinin seyri:İnici-çıkıcı seyre sahip olan Hicaz makamının seyrine Nevâ perdesi civarından başlanır. Bazen dizinin alt ve üst tarafından başlayan eserler yapılmışsa da, bu diziler de hemen orta seslere geçmiştir. Hicaz dörtlüsünün sesleri verilerek güçlü olan Nevâ perdesinde kalış yapılır. Sonra dizinin üst tarafında bulunan Rast beşlisinin seslerine geçilir. Tiz Duraktan, Güçlüye doğru inilirken genellikle Fa diyez (Evç perdesi) bekar yapılarak Acem perdesi haline getirilir. Bu şekilde inici olarak Nevâ’da bir Bûselik Beşlisi meydana gelmiş olur. Güçlü perdesinde kalış gösterilerek, karışık seslerle Hicaz dörtlüsünde gezinilerek Dügâh perdesinde karar verilir.
`,
    },
    nihavend: {
      makamName:'Nihavend',
      info:`Durağı: Rast perdesidir.
Seyri: İnici-çıkıcıdır. Bâzen çıkıcı, bâzen de inici gibi seyre başlarsa da, hemen çıkıcı-inici hâle döner.   
Güçlüsü: Neva perdesidir.
Yeden: Irak perdesidir.
Donanımı: Si ve mi küçük mücenneb bemolü donanıma yazılır. Gerekli diğer değişiklikler eser içinde gösterilir.
Perdelerin T.M.deki isimleri: Rast, Dügâh, Kürdi, Çargâh, Nevâ, Nim Hisâr, Acem, Gerdâniye’dir. Nevâ’da Hicaz olduğu zaman Nevâ, Hisâr, Eviç, Gerdâniye perdeleri kullanılır.
Dizinin Seyri: İnici-çıkıcı seyre sahip olan Nihavend makamını seyrine genellikle orta seslerden başlanır. Dizini son derece kullanılabilir olaması nedeniyle çok çeşitli seslerde-dizilerde dolaşılabilir. Genellikle Nevâ perdesi üzerindeki Kürdi veya Hicaz Dörtlüsünün sesleri kullanılarak Güçlü sesi olan Nevâ perdesinde asma karar yapılır.
Genişleme sesleri olan Bûselik Beşlisinin sesleri kullanılarak tiz seslerde dolaşılır. Yukarıdan aşağıya inilerek, çeşitli geçkilerle Nevâ perdesinde tekrar kalış gösterilir. Dizinin orta seslerinde dolaşılır.
Karara doğru Bûselik’li olarak inilir. Dizi alt taraftan Hicaz’lı olarak genişleme yapar. Bûselik Beşlisinin sesleri ile yeden olan Irak Perdesi de belirtilerek Rast Perdesinde karar verilir.
`,
    },
    ussak: {
      makamName: 'Uşşak',
      info: `Durağı: Dügâh perdesidir.
Seyri: Çıkıcıdır.
Dizisi: Yerinde Uşşak dörtlüsüne Nevâ’da Bûselik beşlisinin eklenmesinden meydana gelmiştir.
Güçlüsü: Dörtlü ile beşlinin ek yerindeki Nevâ (re) perdesidir. Üzerinde Bûselik çeşnili yarım karar yapılır.
Yedeni: Rast perdesidir.
Donanımı: Yalnız si için koma bemolü donanıma yazılır.
Dizinin Seyri:Uşşak makamı da Rast makamı gibi ağır yapılı bir makamdır.Çıkıcı diziye sahip olduğundan,seyre durak perdesi civarından başlanır. Uşşak dörtlüsünün sesleri kullanılarak Güçlü olan Nevâ perdesinde asma kalış yapılır.
Perdelerin T.M.deki isimleri: Dügâh, Segâh, Çargâh, Nevâ, Hüseyni, Acem, Gerdâniye ve Muhayyer’dir.
Genişlemesi: Uşşak makamı dizisi alt tarafından genişleme yapar.Genişleme Yegâh perdesindeki Rast Beşlisiyle olur. Dizinin seslerinde karışık olarak gezindikten sonra Nevâ’da asma kalış yapılır. Karar gidilirken özellikle Segâh perdesinde kalış gösterilir. Uşşak dörtlüsünün sesleri kullanılarak Dügâh perdesinde karar verilir.
Makamın Özelliği:Uşşak makamı dizisinin ikinci sesi olan Segâh perdesi donanımında gösterildiği gibi 1 koma olarak icra edilmez. Daima 2-3 perde pes icra edilir. Uşşak makamına bu perde ayrı bir özellik verir. Bu ses müzikologlar tarafından şekillendirilmediğinden, biz de koma bemolü ile gösteriyoruz.
`
    },
    kurdi: {
      makamName: 'Kürdi',
      info: `Durağı: Dügâh perdesidir.
Seyri: Çıkıcıdır.
Dizisi: Yerinde Kürdi dörtlüsüne Nevâ perdesinde Bûselik Beşlisinin eklenmesinden meydana gelmiştir.
Güçlüsü: Dörtlü ile beşlinin ek yerindeki Nevâ perdesidir; üzerinde Bûselik çeşnisi bulunur.
Yeden’i: 2.çizgideki sol (Rast) perd’esidir. Bazen Nim Zirgüle’de kullanılır.
Donanımı: Si için küçük mücenneb bemolü donanıma yazılır.
Perdelerin T.M.deki isimleri: Dügâh, Kürdi, Çargâh, Nevâ, Hüseyni, Acem, Gerdaniye, Muhayyer’dir.
Dizinin seyri:Kürdi makamı en az kullanılmış olan makamlarımızdan birisidir. Ağır yapılı bir makamdır. Mevcut eserleri incelediğimiz zaman, bu makam seslerinin genellikle kendi dizisinde dolaştığını görürüz.
Durak sesi civarından seyre başlanarak Kürdi Dörtlüsünün sesleri verilir. Neva perdesinde asma kalış yapılır. Sonra dizinin üst tarafında bulunan Bûselik Beşlisinin seslerine geçilir. Tiz duraktan aşağıya inilirken Nevâ’da Hicaz yapılabilir.
Güçlü’de tekrar kalış gösterildikten sonra Dügâh perdesine inilirken Hicaz Dörtlüsünün sesleri de verilebilir.Ancak bitiş, Kürdi dörtlüsünün sesleri yapılır. Tam karar Dügâh perdesinde yapılır.`
    },
    rast: {
      makamName: 'Rast',
      info: `Durağı: Rast perdesidir.
Seyri: Çıkıcıdır.
Dizisi: Yerinde Rast beşlisine Nevâ’da bir Rast dörtlüsünün eklenmesinden meydana gelmiştir.
Güçlüsü: Neva perdesidir.
Yeden:Irak perdesidir.
Donanımı: Si için koma bemolü, fa için bakiye diyezi donanıma konulur.
Perdelerin T.M.deki isimleri: Rast, Dügâh, Segâh, Çargâh, Nevâ, Hüseyni, Eviç veya Acem, Gerdâniye.
Dizinin Seyri:Çıkıcı seyre sahip olan Rast makamının seyrine Durak sesi civarından başlanır. Dizi alt taraftan genişlemiştir. Çoğu kez bu genişleme seslerinden seyre başlanır. Rast beşlisinin sesleri kullanılarak Neva perdesinde asma kalış yapılır.
Daha sonra dizinin üst tarafında bulunan Rast Dörtlüsünün seslerine geçilir. Ancak çoğunlukla çıkışta kullanılan Evç perdesi inici nağmelerde kullanılan Acem perdesi haline dönüşür. Tekrar Nevâ’da kalış yapılır. Yerinde Rast Beşlisi’nin seslerine geçilerek çeşitli seslerde, özellikle Segâh perdesinde asma kalışlar yapılabilir. Bitiş, Rast Beşlisinin sesleri ile Rast perdesinde çoğunlukla yedenli olarak yapılır.`
    }


  }

  // could refactor and render from a list via map etc (image linking wont work)
  return (
    <View style={[styles.container, {backgroundColor:theme == 'Dark' ? '#2c1a31' : 'white'}]}>
      <ScrollView contentContainerStyle={{flexGrow:1 }}>
        <MakamCard 
          makamName={MAKAMS.hicaz.makamName}
          makamInfo={MAKAMS.hicaz.info}
          imageURI={require("../assets/makams/hicaz.jpg")}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />
        <MakamCard 
          makamName={MAKAMS.nihavend.makamName}
          makamInfo={MAKAMS.nihavend.info}
          imageURI={require("../assets/makams/nihavend.jpg")}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />
        <MakamCard 
          makamName={MAKAMS.ussak.makamName}
          makamInfo={MAKAMS.ussak.info}
          imageURI={require("../assets/makams/ussak.jpg")}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />
        <MakamCard 
          makamName={MAKAMS.kurdi.makamName}
          makamInfo={MAKAMS.kurdi.info}
          imageURI={require("../assets/makams/kurdi.jpg")}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />
        <MakamCard 
          makamName={MAKAMS.rast.makamName}
          makamInfo={MAKAMS.rast.info}
          imageURI={require("../assets/makams/rast.jpg")}
          color={COLOR_PALETTE_1[Math.floor(Math.random() * COLOR_PALETTE_1.length)]}
          />
 

      </ScrollView>
    </View>
  )
}

export default Makams

const styles = StyleSheet.create({
  container:{
    width:'100%',
    height:'100%',
  },
  optionLabel:{
    width:'90%',
    height: 40,
    backgroundColor:'crimson',
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 5
  }

})