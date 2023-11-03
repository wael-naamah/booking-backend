import { Response, Request, NextFunction } from "express";
import tryCatchErrorDecorator from "../../utils/tryCatchErrorDecorator";
import { ServiceContainer } from "../clients";
import {
  AddScheduleRequest,
  Schedule,
  PaginatedForm,
} from "../../../database-client/src/Schema";
import { PaginatedResponse } from "../category/dto";

class SchedulesControllers {
  @tryCatchErrorDecorator
  static async addSchedule(request: Request, res: Response, next: NextFunction) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to add schedule';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as AddScheduleRequest;
    const service = (request as any).service as ServiceContainer;
    const data = await service.scheduleService.addSchedule(form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async getSchedules(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to get all schedules';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const { page = 1, limit = 10 } = request.query as PaginatedForm;
    const service = (request as any).service as ServiceContainer;
    const { data, count } = await service.scheduleService.getSchedules(page, limit);

    const paginatedResult = new PaginatedResponse<Schedule>(
      data,
      Number(page),
      Number(limit),
      count
    );
    res.status(200).json(paginatedResult);
  }

  @tryCatchErrorDecorator
  static async updateSchedule(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to update schedule';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const form = request.body as unknown as Schedule;
    const service = (request as any).service as ServiceContainer;
    const { scheduleId } = request.params;

    const data = await service.scheduleService.updateSchedule(scheduleId, form);

    res.status(200).json(data);
  }

  @tryCatchErrorDecorator
  static async deleteSchedule(
    request: Request,
    res: Response,
    next: NextFunction
  ) {
    // #swagger.tags = ['Schedule'];

    /*
        #swagger.description = 'Endpoint to delete schedule';
         #swagger.parameters['obj'] = {
                     in: 'body',
                     schema: {
                        $email: '',
                        $password: '',
                    },
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    iss: "",
                    aud: "",
                },
                refreshToken: '',
                token: '',
             }
        }
        */
    const service = (request as any).service as ServiceContainer;
    const data = await service.scheduleService.deleteSchedule(
      request.params.scheduleId
    );

    if (data) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "faild" });
    }
  }
}

export default SchedulesControllers;
