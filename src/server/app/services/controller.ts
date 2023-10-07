import { Response, Request, NextFunction } from "express";


import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";

class ServicesControllers {
  @tryCatchErrorDecorator
  static async getServices(request: Request, res: Response, next: NextFunction) {
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

    res.json({up: "up"});
  }

}

export default ServicesControllers;
