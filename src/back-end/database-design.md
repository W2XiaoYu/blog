---
layout: doc
title: 数据库设计
description: 从真实业务出发，把表、约束和迁移过程设计清楚。
---

# 数据库设计

数据库设计很少是把字段列完就结束。这里从真实业务出发，写清楚表为什么这样拆、约束落在哪里，以及需求变化时怎样给自己留一条能回头的路。

- [用 GORM 设计多账号登录与账号合并](./database-design/multi-account-auth-merge) — 手机号、邮箱和第三方登录怎么共用一个用户，重复账号又该怎么合并
- [用 GORM 把一级邀请分佣做清楚](./database-design/direct-invite-commission) — 从一枚邀请码开始，把支付、结算和退款的账走完整
