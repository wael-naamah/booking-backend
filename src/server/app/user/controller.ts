import { Response, Request, NextFunction } from "express";

import { LoginForm, RefreshToken, ResetPasswordForm, User } from "../../../database-client";
import { ServiceContainer } from "../clients";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";

class UserControllers {
  @tryCatchErrorDecorator
  static async signupUser(request: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Auth'];

    /*
        #swagger.description = 'Endpoint to signup';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                        user: {
                            channels: {},
                            remarks: '',
                            phone_number: '',
                            internal: {
                                last_updated_at: {
                                    _seconds: {
                                        type: Number,
                                        $example: 0,
                                    },
                                    _nanoseconds: {
                                        type: Number,
                                        $example: 0,
                                    },
                                },
                                notification_tokens: [],
                                created_at: {
                                    _seconds: {
                                        type: Number,
                                        $example: 0,
                                    },
                                    _nanoseconds: {
                                        type: Number,
                                        $example: 0,
                                    }
                                }
                            },
                            name: '',
                        }
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                    auth_time: "",
                    user_id: "",
                    sub: "",
                    iat: 1648474008,
                    exp: 1648477608,
                    email: "",
                    email_verified: false,
                    firebase: {
                        identities: {
                            email: [""]
                        },
                        sign_in_provider: "password"
                    },
                    uid: ""
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as User;
    const service = (request as any).service as ServiceContainer;
    let v = await service.authService.signupUser(form);
    v.password = '';
    res.json(v);
  }

  @tryCatchErrorDecorator
  static async login(request: Request, res: Response, next: NextFunction) {
      /*
      #swagger.description = 'Endpoint to login';
      #swagger.tags = ['Auth'];
       #swagger.parameters['obj'] = {
                   in: 'body',
                   schema: {
                       $email: '',
                       $password: ''
                   },
      }
      #swagger.responses[200] = {
          schema: {
              user: {
                  iss: "",
                  aud: "",
                  auth_time: "",
                  user_id: "",
                  sub: "",
                  iat: 1648474008,
                  exp: 1648477608,
                  email: "",
                  email_verified: false,
                  firebase: {
                      identities: {
                          email: [""]
                      },
                      sign_in_provider: "password"
                  },
                  uid: ""
              },
              refreshToken: '',
              token: ''
           }
      }
      */
      const form = request.body as LoginForm;

      const service = (request as any).service as ServiceContainer;
      let data = await service.authService.login(form.email, form.password);
      data.password = undefined;
      res.json(data);
  }

  @tryCatchErrorDecorator
  static async refreshToken(request: Request, res: Response, next: NextFunction) {
      /*
      #swagger.description = 'Endpoint to refresh access token';
      #swagger.tags = ['Auth'];
       #swagger.parameters['obj'] = {
                   in: 'body',
                   schema: {
                       $refreshToken: ''
                   },
      }
      #swagger.responses[200] = {
          schema: {
              refreshToken: '',
              token: ''
           }
      }
      */
      const form = request.body as RefreshToken;

      const service = (request as any).service as ServiceContainer;
      let data = await service.authService.refreshToken(form.refreshToken);

      res.json(data);
  }

  @tryCatchErrorDecorator
  static async resetPassword(request: Request, res: Response, next: NextFunction) {
      /*
      #swagger.description = 'Endpoint to refresh access token';
      #swagger.tags = ['Auth'];
       #swagger.parameters['obj'] = {
                   in: 'body',
                   schema: {
                       $refreshToken: ''
                   },
      }
      #swagger.responses[200] = {
          schema: {
              refreshToken: '',
              token: ''
           }
      }
      */
      const form = request.body as ResetPasswordForm;

      const service = (request as any).service as ServiceContainer;
      let data = await service.authService.resetPassword(form);

      res.json(data);
  }
}





export default UserControllers;
