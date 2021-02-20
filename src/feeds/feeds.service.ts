import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feeds } from './entities/feeds.entity';
import { Repository } from 'typeorm';
import * as feed from 'rss-to-json';
import * as FormData from 'form-data';
import axios from 'axios';
import { config } from '../config/config';
import { Posts } from './entities/posts.entity';
import { Cron } from '@nestjs/schedule';
import { htmlToText } from "html-to-text";

@Injectable()
export class FeedsService {
  constructor(
    @InjectRepository(Feeds) private readonly feedsRepository: Repository<Feeds>,
    @InjectRepository(Posts) private readonly postsRepository: Repository<Posts>,
  ) {
  }

  @Cron(`0 */${config.cronCycle} * * * *`)
  async getFeedResponse() {
    console.log('cron job started running');
    let token = config.token;

    const res = await this.signIn();
    if (!res.error) {
      token = res.data?.body?.jwtToken;
    }

    this.feedsRepository.find()
      .then(async feeds => {
        for (let i = 0; i < feeds.length; i++) {
          const rss = await feed.load(feeds[i].url);

          if (rss['items'] && rss['items'].length > 0) {
            for (let j = 0; j < rss['items'].length; j++) {
              // check if already stored
              const title = htmlToText(rss['items'][j]['title']);
              const previous = await this.postsRepository.findOne({
                where: {
                  title: title,
                  url: rss['items'][j]['url'],
                },
              });

              if (!previous) { // already stored
                const postEntity = new Posts();
                const entity = Object.assign(postEntity, {
                  title: title,
                  url: rss['items'][j]['url'],
                });
                await this.postsRepository.save(entity);

                const bodyFormData = new FormData();
                bodyFormData.append('content', `${title} ${rss['items'][j]['url']}`);
                bodyFormData.append('auto_share', 'true');
                bodyFormData.append('bot_id', feeds[i].botId);

                axios({
                  method: 'post',
                  url: 'http://api.baykusapp.co/api/v1/posts/asBot',
                  data: bodyFormData,
                  headers: {
                    ...bodyFormData.getHeaders(),
                    'Authorization': token,
                    'Content-Type': 'form-data;charset=UTF-8',
                  },
                }).then(
                  response => {
                    console.log('successfully submitted');
                    console.log(response.data);
                  },
                ).catch(
                  error => {
                    console.log('submit error');
                    console.log(error?.response?.data);
                  },
                );
              }
            }
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  async signIn() {
    try {
      const response = await axios({
        method: 'post',
        url: 'http://api.baykusapp.co/api/v1/user/login',
        data: this.JSON_to_URLEncoded({
          username: config.username,
          password: config.password,
        }, '', []),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      console.log('login success: ', response.data);
      return {
        error: null,
        data: response.data
      };
    } catch (e) {
      console.log('login error: ', e.response?.data);
      return {
        error: e.response?.data,
        data: null,
      }
    }

  }

  JSON_to_URLEncoded(element, key, listP){
    let list = listP || [];
    if(typeof(element) === 'object'){
      for (let idx in element)
        this.JSON_to_URLEncoded(element[idx],key ? key+'[' + idx + ']' : idx, list);
    } else {
      list.push(key + '=' + encodeURIComponent(element));
    }
    return list.join('&');
  }
}
