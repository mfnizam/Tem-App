#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <DallasTemperature.h>
#include <OneWire.h>

LiquidCrystal_I2C lcd(0x27, 20,4); 

const int insensorSuhu = 2;          //Temperature
const int insensorPH = A0;          //pH
const int insensorKeruh = A1;          //Kekeruhan

 
byte Simbol_derajat = B11011111; 

//Temperature                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
OneWire oneWire(insensorSuhu);
DallasTemperature sensors(&oneWire);
float tempC = 0;

//PH
int sensorValue = 0; 
unsigned long int avgValue; 
float b;
int buf[10],temp;
float phValue = 0;  

//Kekeruhan
static float kekeruhan; 
static float teg;

//ambildataESP
String bacaString;

//Setting
float batasBawahSuhu = 30 ;
float batasAtasSuhu = 33 ;
float batasAtasKekeruhan = 50 ;
float batasBawahPh = 7.5 ;
float batasAtasPh = 8.5 ;


///////////////////////////////////
 int relayPHuP = 8;
 int relayPHdown= 9;
 int relayfan= 10;
 int relayheater= 12;
 int relayfilter = 11;
/////////////////////////////////// 
void setup()
{
    lcd.init();
    sensors.begin();
    lcd.backlight();
    Serial.begin(9600);
    while(!Serial){
    ;
    }
  Serial.println("Serial arduino ready");
  Serial1.begin(9600);
  Serial.println("Serial to esp ready");
  delay(10);

    pinMode(relayPHuP, OUTPUT);
    pinMode(relayPHdown, OUTPUT);
    pinMode(relayheater, OUTPUT);
    pinMode(relayfan, OUTPUT);
    pinMode(relayfilter, OUTPUT);
    

}
/////////////////////////////////////////////////
boolean onokData = false;
//////////////////////////////////////////////
void loop()
  {
    if(!onokData){
      sensorPH();
      sensorSuhu();
      sensorKekeruhan();
      tampilanLCD();
      KirimDataKeEsp(tempC, phValue, kekeruhan); 
    }
    AmbilDataEsp();
  }             
void sensorPH(){
  int z ;
  phValue =0;
  for(z=0;z<50; z++){
             for(int i=0;i<10;i++) 
             { 
              buf[i]=analogRead(insensorPH);
              delay(1);
             }
             for(int i=0;i<9;i++)
             {
              for(int j=i+1;j<10;j++)
              {
               if(buf[i]>buf[j])
               {
                temp=buf[i];
                buf[i]=buf[j];
                buf[j]=temp;
               }
              }
             }
             avgValue=0;
             for(int i=2;i<8;i++)
             avgValue+=buf[i];
             float pHVol=(float)avgValue*5.0/1024/6;
             phValue += -5.70 * pHVol + 21.34;
            }phValue /=z;
             
//             Serial.print("pH = ");
//             Serial.println(phValue,1);
             
             if(phValue<=batasBawahPh)
             {
              digitalWrite(relayPHuP,LOW); //mekan
              digitalWrite(relayPHdown,HIGH); //mati
             }
             else if(phValue>=batasAtasPh)
             {
              digitalWrite(relayPHdown,LOW);
              digitalWrite(relayPHuP,HIGH);  
             }
             else
             {
              digitalWrite(relayPHuP,HIGH);
              digitalWrite(relayPHdown,HIGH);
             }
                ;  
          }
/////////////////////////////////////////////////////////////
void sensorSuhu(){
    sensors.requestTemperatures();
          tempC = sensors.getTempCByIndex(0);
//          Serial.print("suhu = ");
//          Serial.println(tempC);

         if(tempC<=batasBawahSuhu)
         {
          digitalWrite(relayheater,LOW);
          digitalWrite(relayfan,HIGH);
         }
         else if(tempC>=batasAtasSuhu)
         {
          digitalWrite(relayfan,LOW);
          digitalWrite(relayheater,HIGH);  
         }
         else
         {
          digitalWrite(relayfan,HIGH);
          digitalWrite(relayheater,HIGH);
         }
              ;
}
        
///////////////////////////////////////////////////////////
void sensorKekeruhan(){
          int val = analogRead(insensorKeruh);
          teg = val*(5.0/1024);
          kekeruhan = 100.00-(teg/4.10)*100.00;
//          Serial.print("tegangan = ");
//          Serial.print(teg);
//          Serial.print("  nilai Adc = ");
//          Serial.print(val);
//          Serial.print("  nilai kekeruhan = ");
//          Serial.print(kekeruhan); 
//          Serial.println("  NTU");      
//      
               if(kekeruhan > batasAtasKekeruhan)
               {
                digitalWrite(relayfilter,LOW);
               }
               else
               {
                digitalWrite(relayfilter,HIGH);
               }
                    ;
      }
      
///////////////////////////////////////////////////////////

void KirimDataKeEsp(float dSuhu, float dpH, float dKeruh){
  String cc = String(dSuhu);
  cc += "o,";
  cc += String(dpH);
  cc += "p,";
  cc += String(dKeruh);
  cc += "q,";
  cc += String();
  for(int i = 0; i < cc.length(); i++){
    Serial1.write(cc[i]);
  }
}
///////////////////////////////////////////////////////////
void AmbilDataEsp(){
  while(Serial1.available()){
    char a = Serial1.read();
    if(a == ','){
      if (bacaString.length() > 1) {
        float n = bacaString.toFloat();  
        if(bacaString.indexOf('a') >0){
          batasBawahSuhu = n;
          Serial.print("batas bawah suhu: ");
          Serial.println(batasBawahSuhu);
        }else if(bacaString.indexOf('b') >0){
          batasAtasSuhu = n;
          Serial.print("batas atas suhu: ");
          Serial.println(batasAtasSuhu);
        }else if(bacaString.indexOf('e') >0){
          batasBawahPh = n;
          Serial.print("batas bawah ph: ");
          Serial.println(batasBawahPh);
        }else if(bacaString.indexOf('f') >0){
          batasAtasPh = n;
          Serial.print("batas atas ph: ");
          Serial.println(batasAtasPh);
        }
        else if(bacaString.indexOf('g') >0){
          batasAtasKekeruhan = n;
          Serial.print("batas kekeruhan: ");
          Serial.println(batasAtasKekeruhan);
        } 
        bacaString="";
      }
    }else{
      bacaString += a;
    }
  }onokData = false;  
}
  
///////////////////////////////////////////////////////////

void tampilanLCD(){
          lcd.clear();
          lcd.setCursor(4, 0);
          lcd.print("Water Quality");
//////////////////////SUHU/////////////////////////////          
          lcd.setCursor(0, 1);
          lcd.print("Temp");
          lcd.setCursor(5, 1);
          lcd.print(":");
          lcd.setCursor(6,1);
          lcd.print(tempC,1);
          lcd.setCursor(10,1);
          lcd.write(Simbol_derajat);
          lcd.setCursor(11,1);
          lcd.print("C");
////////////////////////PH///////////////////////////          
          lcd.setCursor(0,2);
          lcd.print("pH");
          lcd.setCursor(5, 2);
          lcd.print(":");
          lcd.setCursor(6,2);
          lcd.print(phValue,1);
/////////////////////////KEKERUHAN/////////////////////////          
          lcd.setCursor(0,3);
          lcd.print("Keruh");
          lcd.setCursor(5,3);
          lcd.print(":");
          lcd.setCursor(6,3);
          lcd.print( kekeruhan,1 );
          lcd.print("NTU");
                    
      }
