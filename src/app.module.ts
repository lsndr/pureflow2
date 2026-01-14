import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FileModule } from './file/file.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { ProductsModule } from './products/products.module';
import { OrmModule } from './orm/orm.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpClientService } from './httpclient/httpclient.service';
import { HttpClientModule as HttpClientModule } from './httpclient/httpclient.module';
import { TraceMiddleware } from './components/trace.middleware';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { AppResolver } from './app.resolver';
import { PartnersModule } from './partners/partners.module';
import { EmailModule } from './email/email.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    OrmModule,
    AuthModule,
    UsersModule,
    FileModule,
    SubscriptionsModule,
    TestimonialsModule,
    ProductsModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    HttpClientModule,
    GraphQLModule.forRootAsync<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      useFactory: async (configService: ConfigService) => ({
        autoSchemaFile: true,
        graphiql: false, // Disable GraphiQL to prevent introspection
        introspection: false, // Disable introspection globally
        context: ({ req }) => {
          // Implement custom logic to allow introspection only for authorized users
          const isAuthorized = req.headers['x-api-key'] === configService.get('API_KEY');
          return { isAuthorized };
        },
        validationRules: [
          (context) => {
            return {
              Field: {
                enter(node) {
                  if (node.name.value === '__schema' && !context.isAuthorized) {
                    throw new Error('Introspection is not allowed');
                  }
                }
              }
            };
          }
        ]
      }),
      inject: [ConfigService],
    }),
    PartnersModule,
    EmailModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [
    HttpClientService,
    AppService,
    UsersService,
    ConfigService,
    AppResolver
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('(.*)');
  }
}