import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent} from 'leaflet'
import axios from "axios";

import api from "../../services/api";

import "./style.css";

import logo from "../../assets/logo.svg";

//aray ou objeto: manualmente informar o tipo do objeto

interface Item {
  id: number;
  title: string;
  image_url: string;
}
interface IBGE {
  sigla: string;
}
interface IBGECity {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initialPosition,setInitialPosition] = useState<[number, number]>([0,0]);

  const[formData, setFormData] = useState({
    name:' ',
    email:' ',
    whatsapp:' ',
  });

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedUF, setSelectedUF] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");
  const [selectedItens, setSelectedItens] = useState<number[]>([]);

  const history = useHistory();

  useEffect(() =>{
    navigator.geolocation.getCurrentPosition(position =>{
      const {latitude, longitude} = position.coords;

      setInitialPosition([latitude,longitude]);
    })
  }
  )

  useEffect(() => {
    api.get("items").then((res) => {
      setItems(res.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGE[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      )
      .then((res) => {
        const ufSigla = res.data.map((uf) => uf.sigla);
        setUfs(ufSigla);
      });
  });
  //carregar as cidades toda vez que o usuario selecionar o UF
  useEffect(() => {
    if(selectedUF ==='0'){
      return;
    }
    axios
      .get<IBGECity[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`
      )
      .then((res) => {
        const cityName = res.data.map((city) => city.nome);
        setCities(cityName);
      });
    console.log('mudou', selectedUF);
  }, [selectedUF]);

  function selectuf(event: ChangeEvent<HTMLSelectElement>) {
    const uF = event.target.value;
    setSelectedUF(uF);
  }

  function selectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  function mapClick(event:LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  };

  function inputChage(event: ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target;
    setFormData({...formData, [name]: value })
  }
  
  function clickItem(id:number){
    const alreadySelected = selectedItens.findIndex(item => item === id);
    if(alreadySelected >= 0 ){
      const filteredItems = selectedItens.filter(item => item != id);
      setSelectedItens(filteredItems);
    }else{
      setSelectedItens([...selectedItens, id]);
    }
    
  }

  function handSubmit(event:FormEvent){
    event.preventDefault();

    const {name,email, whatsapp} = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longtude] = selectedPosition;
    const items = selectedItens;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longtude,
      items,
    }
    api.post('points', data);
    alert("Cadastro concluido");
    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Logo" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
            type="text"
            name="name"
            id="name"
            onChange={inputChage}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="name">E-mail</label>
              <input
              type="email" 
              name="email" 
              id="email"
              onChange={inputChage}
               />
            </div>
            <div className="field">
              <label htmlFor="name">Whatsapp</label>
              <input 
              type="text" 
              name="whatsapp" 
              id="whatsapp" 
              onChange={inputChage}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione endereço no mapa</span>
          </legend>
          <Map onclick={mapClick} center={initialPosition} zoom={15}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
              name="uf"
              id="uf"
              value={selectedUF}
              onChange={selectuf}>
                <option value="0">Selecione um UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
              name="city"
              id="city"
              onChange={selectCity}
              value={selectedCity}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li key={item.id}
              onClick={() => clickItem(item.id)}
              className={selectedItens.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
