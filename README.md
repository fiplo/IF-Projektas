# Internetinių skelbimų portalas

Kompiuterinių tinklų IT projektas, siekiantis padaryti paprastą skelbimų portalą

## Projekto Pasiruošimas 

Šios instrukcijos jums padės įsidiegti projekto kopiją.

### Prielaidos

Šiam projektui jums reikės įsidiegti šias priklausomybes.


`node` - [Node.js runtime](https://github.com/nodejs/node)

`mongo` - [MongoDB Database](https://github.com/mongodb/mongo)

### Instaliacija

Turint projektui reikiamas priklausomybes, galime paprastai įsidiegti projektą.

1. Nusiklonuojame projektą (pvz.: `git clone https://github.com/fiplo/It-Tinklai`).
2. Įdiegiame reikiamus paketus paleidę komandą `npm install` komandinėję eilutėje.
3. Paleidžiame projektą su komandą `npm start`.
4. Projektas bus paleistas, jį galite pasiekti nuoruoda : [localhost:8080](http://localhost:8080).

## TODO

- Administratoriaus panelė
- Skelbimų ištrynimas
- Žinučių sistema
- Vartotojų tipai
- Kelių nuotraukų talpinimas

## DB
@startuml
object User {
  -email : String
  -password : String
  -isAdmin : Boolean
  -isOP : Boolean
}

object Post {
  +postname : String
  +desc : String
  +author : User
  +created_at : Date
  +updated_at : Date
}

object File {
  -originalname : String
  +destination : String
  +filename : String
  +path : String
  +created_at : Date
  +updated_at : Date
}

object Message {
  -Text : String
  -Author : User
  -created_at : Date
}

User "1..1" -- "0..*" Post : Turi
Post "0..1" -- "0..4" File : Turi
Post "1..1" -- "0..*" Message : Turi



@enduml
