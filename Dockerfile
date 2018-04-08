FROM node:9.10-alpine

RUN mkdir /home/work \
    && mkdir /home/work/issue-bot \
    && apk add --update bash

COPY LICENSE package-lock.json package.json run.sh /home/work/
COPY ./issue-bot/ /home/work/issue-bot/

RUN addgroup -g 1001 bot \
    && adduser -u 1001 -D -G bot bot

USER bot

WORKDIR /home/work
RUN mkdir /home/bot/issue-bot \
    && cp ./*.* /home/bot \
    && cp -r ./issue-bot/* /home/bot/issue-bot \
    && chmod 755 -R /home/bot

WORKDIR /home/bot
RUN npm install -s

CMD ["ash", "./run.sh"]