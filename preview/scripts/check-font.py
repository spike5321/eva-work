from pathlib import Path
import struct
root=Path(__file__).resolve().parents[1]
# Inspect actual OTF Unicode cmap without installing a font parser.
data=(root/'public/assets/FOT-MatisseElegantoPro-EB.otf').read_bytes()
u16=lambda o:struct.unpack_from('>H',data,o)[0]
u32=lambda o:struct.unpack_from('>I',data,o)[0]
tables={data[12+i*16:16+i*16].decode('ascii'):(u32(20+i*16),u32(24+i*16)) for i in range(u16(4))}
base=tables['cmap'][0];codes=set()
for i in range(u16(base+2)):
 o=base+u32(base+8+i*8);fmt=u16(o)
 if fmt==12:
  for j in range(u32(o+12)):
   a,b,g=struct.unpack_from('>III',data,o+16+j*12);codes.update(range(a,b+1))
 if fmt==4:
  n=u16(o+6)//2;ends=o+14;starts=ends+n*2+2;deltas=starts+n*2;offsets=deltas+n*2
  for j in range(n):
   a,b=u16(starts+j*2),u16(ends+j*2);delta=u16(deltas+j*2);off=u16(offsets+j*2)
   for ch in range(a,b+1):
    glyph=(ch+delta)&65535 if not off else u16(offsets+j*2+off+(ch-a)*2)
    if glyph:codes.add(ch)
text='系統喚醒駕駛員確認綾波麗零號機同步率接續準備完成進入工作台新對話專案設計預覽工具文件偏好設定搜尋'
print('Font glyph coverage:',len(codes),'Missing codepoints:',[hex(ord(c)) for c in sorted(set(text)-set(map(chr,codes)))])
base=tables['name'][0]
for i in range(u16(base+2)):
 platform,enc,lang,nid,length,offset=struct.unpack_from('>HHHHHH',data,base+6+i*12)
 if platform==3 and nid in (1,2,6):print('Font name',nid,data[base+u16(base+4)+offset:base+u16(base+4)+offset+length].decode('utf-16-be'))
