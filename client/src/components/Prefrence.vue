<template>
    <div class="matches">

        <v-container class="my-3" grid-list-xl text-center>
            <v-layout  justify-space-around wrap>
               <v-flex xs6>
                <v-dialog max-width="800px" >
                    <v-btn block slot="activator" color="pink" dark>Find a Match</v-btn>
                    <v-card color="#FAFAFA">
                        <v-toolbar class="text-xs-center" height="60px" color="deep-purple accent-4" dark>
                        <v-toolbar-title >SUITED MATCHES</v-toolbar-title>
                        </v-toolbar>
                        <v-layout row wrap>
                        <v-flex xs12  sm6 md4 lg3 v-for="match in matches" :key="match.username">
                            <v-card height="100%" color=""  flat class="text-xs-center ma-1">
                                <v-img
                                    class="white--text"
                                    height="250"
                                    :src="match.img"
                                    >
                                    <v-card-title class="align-end fill-height title font-weight-light">{{ match.username }}</v-card-title>
                                </v-img>
                                <v-card-text>
                                    <div class="font-weight-thin">{{ match.bio }}</div>
                                    <div >{{ match.age }}</div>
                                </v-card-text>
                                <v-card-actions>
                                    <v-btn  flat color="">
                                        <v-icon color="black">delete_forever</v-icon>
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                        <v-btn flat color="">
                                        <v-icon color="pink">favorite</v-icon>
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-flex>
                    </v-layout>
                    </v-card>
                </v-dialog>
            </v-flex>
        </v-container>
    </div>
</template>