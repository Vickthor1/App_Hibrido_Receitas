//hook para gerenciar os favoritos
import {useEffect, useState} from "react";

//importa o tipo Receita
import {Receita} from "../tipos/receita";

//importa os métodos de armazenamento de favoritos
import {
    salvarFavorito,
    CarregarFavoritos,
} from "..armazenamento/favoritos";